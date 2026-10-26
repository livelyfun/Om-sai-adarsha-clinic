import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { verifyPatientProfileOwnership } from '@/lib/auth/guards';
import { recordAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();

  // Rule 1: Signed in as patient & verified
  if (!auth.user || auth.user.userType !== 'patient') {
    return NextResponse.json({ error: 'You must be signed in to submit a booking request.' }, { status: 401 });
  }

  if (!auth.user.emailVerifiedAt) {
    return NextResponse.json(
      { error: 'Email verification is required before you can submit a booking request. Please verify your email first.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { profileId, doctorId, serviceId, preferredDate, preferredTime, patientNotes, serviceAnswers } = body;

    if (!profileId || (!doctorId && !serviceId) || !preferredDate || !preferredTime) {
      return NextResponse.json({ error: 'Profile, clinical provider/service, date, and time are required.' }, { status: 400 });
    }

    // Rule 2: Profile must belong to the signed-in patient account
    const isOwner = await verifyPatientProfileOwnership(profileId, auth.user.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Selected patient profile not found or unauthorized.' }, { status: 404 });
    }

    // Rule 3: Cap open requests (pending or reschedule_proposed)
    const maxOpen = db.getSetting('max_open_requests_per_patient') ?? 5;
    const currentOpen = db.countPatientOpenRequests(auth.user.id);
    if (currentOpen >= maxOpen) {
      return NextResponse.json(
        { error: `You have reached the maximum allowed limit of ${maxOpen} open booking requests. Please wait for reception review before submitting more.` },
        { status: 429 }
      );
    }

    // Validate preferred date & time window
    const [hours, minutes] = preferredTime.split(':').map(Number);
    const startDateTime = new Date(`${preferredDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`);
    const now = Date.now();

    if (isNaN(startDateTime.getTime()) || startDateTime.getTime() <= now) {
      return NextResponse.json({ error: 'Requested booking time cannot be in the past.' }, { status: 400 });
    }

    const minLeadHours = db.getSetting('min_lead_time_hours') ?? 2;
    if (startDateTime.getTime() - now < minLeadHours * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: `Requests must be submitted at least ${minLeadHours} hours in advance.` },
        { status: 400 }
      );
    }

    const maxAdvanceDays = db.getSetting('max_advance_booking_days') ?? 30;
    if (startDateTime.getTime() - now > maxAdvanceDays * 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: `Requests cannot be made more than ${maxAdvanceDays} days in advance.` },
        { status: 400 }
      );
    }

    // Check clinic holiday closures
    const closures = db.getClinicClosures();
    const isClosed = closures.some(c => preferredDate >= c.startDate && preferredDate <= c.endDate);
    if (isClosed) {
      return NextResponse.json(
        { error: 'The clinic is closed on the selected date for scheduled holiday. Please select another date.' },
        { status: 400 }
      );
    }

    // Snapshots: doctor name and displayed fee
    let doctorNameSnapshot = '';
    let feeSnapshot = 0;
    let slotMinutes = 20;

    if (doctorId) {
      const doctor = db.getDoctorById(doctorId);
      if (!doctor || !doctor.isActive) {
        return NextResponse.json({ error: 'Selected doctor is not available.' }, { status: 400 });
      }
      doctorNameSnapshot = `${doctor.nameEn} (${doctor.specialtyEn})`;
      feeSnapshot = doctor.consultationFee;
      slotMinutes = doctor.slotDurationMinutes || 20;
    } else if (serviceId) {
      const service = db.getMedicalServiceById(serviceId);
      if (!service || !service.isActive || service.bookingMode !== 'request') {
        return NextResponse.json({ error: 'Selected service cannot be requested online.' }, { status: 400 });
      }
      doctorNameSnapshot = service.nameEn;
      feeSnapshot = service.fee;
    }

    const endDateTime = new Date(startDateTime.getTime() + slotMinutes * 60 * 1000);

    // Create Request (Initial status: 'pending')
    const appointment = db.createAppointment({
      profileId,
      doctorId: doctorId || undefined,
      serviceId: serviceId || undefined,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status: 'pending',
      doctorNameSnapshot,
      feeSnapshot,
      patientNotes: patientNotes || '',
      serviceAnswersJson: serviceAnswers || {},
    });

    // Record initial status history event
    db.addBookingStatusEvent({
      bookingType: 'appointment',
      bookingId: appointment.id,
      fromStatus: 'none',
      toStatus: 'pending',
      actorType: 'patient',
      actorUserId: auth.user.id,
      patientMessage: 'Booking request submitted online.',
    });

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: 'patient',
      action: 'submit_appointment_request',
      entityType: 'appointment',
      entityId: appointment.id,
      metadata: { referenceNo: appointment.referenceNo, profileId },
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        referenceNo: appointment.referenceNo,
        status: appointment.status,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        doctorNameSnapshot: appointment.doctorNameSnapshot,
        feeSnapshot: appointment.feeSnapshot,
      },
    });
  } catch (err: any) {
    console.error('Appointment submission error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit request' }, { status: 500 });
  }
}
