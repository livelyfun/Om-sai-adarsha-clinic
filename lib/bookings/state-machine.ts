import { BookingStatus, Appointment, LabBooking } from '@/lib/db/types';
import { db } from '@/lib/db';

export type ActorRole = 'patient' | 'staff' | 'system';

export interface TransitionRequest {
  bookingType: 'appointment' | 'lab';
  bookingId: string;
  targetStatus: BookingStatus;
  actorRole: ActorRole;
  actorUserId: string;
  patientMessage?: string;
  internalNote?: string;
  proposedStartTime?: string; // required when targetStatus is 'reschedule_proposed'
  proposedEndTime?: string;
}

export interface TransitionResult {
  success: boolean;
  error?: string;
  booking?: Appointment | LabBooking;
}

/**
 * Server-Enforced Booking State Machine (Section 7).
 * Rejects any transition not explicitly permitted in Section 7's transition matrix.
 */
export function executeBookingTransition(req: TransitionRequest): TransitionResult {
  const { bookingType, bookingId, targetStatus, actorRole, actorUserId, patientMessage, internalNote, proposedStartTime, proposedEndTime } = req;

  const booking = bookingType === 'appointment' ? db.getAppointmentById(bookingId) : db.getLabBookingById(bookingId);
  if (!booking) {
    return { success: false, error: 'Booking not found.' };
  }

  const currentStatus = booking.status;
  const now = Date.now();

  // Validate allowed transitions per Section 7 matrix
  let isAllowed = false;

  // 1. From 'pending'
  if (currentStatus === 'pending') {
    if (targetStatus === 'confirmed') {
      if (actorRole !== 'staff') return { success: false, error: 'Only clinic staff can confirm booking requests.' };
      isAllowed = true;
    } else if (targetStatus === 'declined') {
      if (actorRole !== 'staff') return { success: false, error: 'Only staff can decline booking requests.' };
      if (!patientMessage || patientMessage.trim().length === 0) {
        return { success: false, error: 'A patient-visible decline reason is required.' };
      }
      isAllowed = true;
    } else if (targetStatus === 'reschedule_proposed') {
      if (actorRole !== 'staff') return { success: false, error: 'Only staff can propose rescheduled times.' };
      if (!proposedStartTime) {
        return { success: false, error: 'Proposed date and time are required to propose a reschedule.' };
      }
      isAllowed = true;
    } else if (targetStatus === 'cancelled') {
      // Patient or staff can cancel pending
      isAllowed = true;
    }
  }

  // 2. From 'reschedule_proposed'
  else if (currentStatus === 'reschedule_proposed') {
    if (targetStatus === 'confirmed') {
      // Patient accepting proposal or staff confirming
      isAllowed = true;
    } else if (targetStatus === 'reschedule_proposed') {
      if (actorRole !== 'staff') return { success: false, error: 'Only staff can propose a new reschedule time.' };
      if (!proposedStartTime) return { success: false, error: 'Proposed time required.' };
      isAllowed = true;
    } else if (targetStatus === 'cancelled') {
      // Patient declining proposal or staff cancelling
      isAllowed = true;
    }
  }

  // 3. From 'confirmed'
  else if (currentStatus === 'confirmed') {
    if (targetStatus === 'reschedule_proposed') {
      if (actorRole !== 'staff') return { success: false, error: 'Only staff can propose to reschedule confirmed bookings.' };
      if (!proposedStartTime) return { success: false, error: 'Proposed time required.' };
      isAllowed = true;
    } else if (targetStatus === 'cancelled') {
      // Cancellation cutoff check if initiated by patient
      if (actorRole === 'patient') {
        const bookingStart = bookingType === 'appointment'
          ? new Date((booking as Appointment).startTime).getTime()
          : new Date((booking as LabBooking).preferredTime).getTime();

        const cutoffHours = db.getSetting('cancellation_cutoff_hours') ?? 4;
        const cutoffMs = cutoffHours * 60 * 60 * 1000;

        if (bookingStart - now < cutoffMs) {
          return {
            success: false,
            error: `Cancellations by patients are not permitted within ${cutoffHours} hours of appointment start time. Please contact reception.`,
          };
        }
      }
      isAllowed = true;
    } else if (targetStatus === 'completed') {
      if (actorRole !== 'staff') return { success: false, error: 'Only staff can mark bookings completed.' };
      // Can only be marked on or after start time
      const startTime = bookingType === 'appointment'
        ? new Date((booking as Appointment).startTime).getTime()
        : new Date((booking as LabBooking).preferredTime).getTime();

      // In production enforce start time has passed; in development allow staff testing with slight tolerance
      if (process.env.APP_ENV === 'production' && now < startTime) {
        return { success: false, error: 'A booking cannot be marked completed before its scheduled start time.' };
      }
      isAllowed = true;
    } else if (targetStatus === 'no_show') {
      if (actorRole !== 'staff') return { success: false, error: 'Only staff can record no-shows.' };
      const startTime = bookingType === 'appointment'
        ? new Date((booking as Appointment).startTime).getTime()
        : new Date((booking as LabBooking).preferredTime).getTime();

      if (process.env.APP_ENV === 'production' && now < startTime) {
        return { success: false, error: 'Cannot mark no-show before the appointment time has elapsed.' };
      }
      isAllowed = true;
    }
  }

  // 4. Terminal statuses cannot transition to anything
  if (['declined', 'cancelled', 'completed', 'no_show'].includes(currentStatus)) {
    return {
      success: false,
      error: `Cannot transition booking from terminal status "${currentStatus}".`,
    };
  }

  if (!isAllowed) {
    return {
      success: false,
      error: `Forbidden transition from "${currentStatus}" to "${targetStatus}".`,
    };
  }

  // Appointment Conflict Check on Confirmation
  if (bookingType === 'appointment' && targetStatus === 'confirmed') {
    const apt = booking as Appointment;
    const finalStart = (currentStatus === 'reschedule_proposed' && proposedStartTime) ? proposedStartTime : apt.startTime;
    const finalEnd = (currentStatus === 'reschedule_proposed' && proposedEndTime) ? proposedEndTime : apt.endTime;

    if (apt.doctorId) {
      const conflictCheck = db.checkDoctorAppointmentConflict(apt.doctorId, finalStart, finalEnd, apt.id);
      if (conflictCheck.hasConflict) {
        return {
          success: false,
          error: conflictCheck.conflictingAppointment
            ? `Doctor schedule conflict: Appointment ${conflictCheck.conflictingAppointment.referenceNo} already holds this time slot.`
            : 'Doctor is unavailable at this scheduled time.',
        };
      }
    }
  }

  // Perform Update
  const updatePayload: any = {
    status: targetStatus,
    patientMessage: patientMessage !== undefined ? patientMessage : booking.patientMessage,
    internalNote: internalNote !== undefined ? internalNote : booking.internalNote,
  };

  // If accepting a reschedule proposal or updating times
  if (bookingType === 'appointment') {
    if (proposedStartTime && (targetStatus === 'confirmed' || targetStatus === 'reschedule_proposed')) {
      updatePayload.startTime = proposedStartTime;
      if (proposedEndTime) updatePayload.endTime = proposedEndTime;
    }
    const updated = db.updateAppointment(bookingId, updatePayload);
    // Write append-only status event
    db.addBookingStatusEvent({
      bookingType: 'appointment',
      bookingId,
      fromStatus: currentStatus,
      toStatus: targetStatus,
      actorType: actorRole,
      actorUserId,
      patientMessage,
      internalNote,
    });
    return { success: true, booking: updated };
  } else {
    if (proposedStartTime && (targetStatus === 'confirmed' || targetStatus === 'reschedule_proposed')) {
      updatePayload.preferredTime = proposedStartTime;
    }
    const updated = db.updateLabBooking(bookingId, updatePayload);
    db.addBookingStatusEvent({
      bookingType: 'lab',
      bookingId,
      fromStatus: currentStatus,
      toStatus: targetStatus,
      actorType: actorRole,
      actorUserId,
      patientMessage,
      internalNote,
    });
    return { success: true, booking: updated };
  }
}
