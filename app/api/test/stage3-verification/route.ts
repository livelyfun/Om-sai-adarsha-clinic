import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeBookingTransition } from '@/lib/bookings/state-machine';

export async function GET() {
  const results: { test: string; status: 'PASSED' | 'FAILED'; details?: string }[] = [];

  try {
    // Setup test doctor
    const testDoctor = db.upsertDoctor({
      slug: `doctor-stage3-${Date.now()}`,
      nameEn: 'Dr. Conflict Test Specialist',
      nameNe: 'डा. परीक्षण विशेषज्ञ',
      specialtyEn: 'Cardiology',
      specialtyNe: 'मुटुरोग',
      consultationFee: 800,
      slotDurationMinutes: 20,
      isActive: true,
      isFeatured: false,
    });

    // Setup 2 distinct patient accounts and profiles
    const patientUserA = db.createUser({
      email: `patient.a.${Date.now()}@example.com`,
      passwordHash: 'dummy',
      userType: 'patient',
      isActive: true,
      emailVerifiedAt: new Date().toISOString(),
      preferredLocale: 'en',
    });
    const profileA = db.createPatientProfile({
      managingUserId: patientUserA.id,
      fullName: 'Patient Alpha',
      relationshipLabel: 'myself',
    });

    const patientUserB = db.createUser({
      email: `patient.b.${Date.now()}@example.com`,
      passwordHash: 'dummy',
      userType: 'patient',
      isActive: true,
      emailVerifiedAt: new Date().toISOString(),
      preferredLocale: 'en',
    });
    const profileB = db.createPatientProfile({
      managingUserId: patientUserB.id,
      fullName: 'Patient Beta',
      relationshipLabel: 'myself',
    });

    // 1. Snapshot Immutability Test
    const apt1 = db.createAppointment({
      profileId: profileA.id,
      doctorId: testDoctor.id,
      startTime: '2026-11-10T10:00:00.000Z',
      endTime: '2026-11-10T10:20:00.000Z',
      status: 'pending',
      doctorNameSnapshot: testDoctor.nameEn,
      feeSnapshot: testDoctor.consultationFee,
    });

    // Now edit the doctor's fee in the catalogue to NPR 1500
    db.upsertDoctor({ ...testDoctor, consultationFee: 1500 });

    const reloadedApt1 = db.getAppointmentById(apt1.id);
    if (reloadedApt1?.feeSnapshot === 800 && db.getDoctorById(testDoctor.id)?.consultationFee === 1500) {
      results.push({ test: 'Catalogue Snapshot Immutability on Bookings', status: 'PASSED' });
    } else {
      results.push({ test: 'Catalogue Snapshot Immutability on Bookings', status: 'FAILED' });
    }

    // 2. State Machine: Allowed and Forbidden Transitions
    // Valid: Staff confirms pending
    const validConfirm = executeBookingTransition({
      bookingType: 'appointment',
      bookingId: apt1.id,
      targetStatus: 'confirmed',
      actorRole: 'staff',
      actorUserId: 'staff-admin-id',
    });

    // Forbidden: Transition directly from pending/confirmed to forbidden status (e.g. Patient confirming)
    const apt2 = db.createAppointment({
      profileId: profileB.id,
      doctorId: testDoctor.id,
      startTime: '2026-11-10T10:10:00.000Z', // Overlaps with apt1!
      endTime: '2026-11-10T10:30:00.000Z',
      status: 'pending',
      doctorNameSnapshot: testDoctor.nameEn,
      feeSnapshot: 800,
    });

    const patientConfirmForbidden = executeBookingTransition({
      bookingType: 'appointment',
      bookingId: apt2.id,
      targetStatus: 'confirmed',
      actorRole: 'patient', // Only staff can confirm!
      actorUserId: patientUserB.id,
    });

    if (validConfirm.success && !patientConfirmForbidden.success) {
      results.push({ test: 'State Machine Transition Validation & Role Permission Check', status: 'PASSED' });
    } else {
      results.push({ test: 'State Machine Transition Validation & Role Permission Check', status: 'FAILED' });
    }

    // 3. Database-Level Overlapping Doctor Appointment Conflict Prevention
    // Apt1 is confirmed for [10:00, 10:20]. Apt2 is [10:10, 10:30] for the same doctor.
    // Staff attempts to confirm Apt2 -> MUST BE REJECTED with conflict!
    const conflictConfirmAttempt = executeBookingTransition({
      bookingType: 'appointment',
      bookingId: apt2.id,
      targetStatus: 'confirmed',
      actorRole: 'staff',
      actorUserId: 'staff-admin-id',
    });

    if (!conflictConfirmAttempt.success && conflictConfirmAttempt.error?.includes('conflict')) {
      results.push({
        test: 'Database-Level Non-Overlapping Appointment Conflict Constraint',
        status: 'PASSED',
        details: conflictConfirmAttempt.error,
      });
    } else {
      results.push({
        test: 'Database-Level Non-Overlapping Appointment Conflict Constraint',
        status: 'FAILED',
        details: 'Failed to block overlapping appointment confirmation!',
      });
    }

    // 4. Reschedule Proposal Lifecycle (Propose -> Accept with conflict re-check)
    const proposeReschedule = executeBookingTransition({
      bookingType: 'appointment',
      bookingId: apt2.id,
      targetStatus: 'reschedule_proposed',
      actorRole: 'staff',
      actorUserId: 'staff-admin-id',
      proposedStartTime: '2026-11-10T11:00:00.000Z', // Non-conflicting new time
      proposedEndTime: '2026-11-10T11:20:00.000Z',
      patientMessage: 'Please come at 11:00 AM instead.',
    });

    const patientAccepts = executeBookingTransition({
      bookingType: 'appointment',
      bookingId: apt2.id,
      targetStatus: 'confirmed',
      actorRole: 'patient',
      actorUserId: patientUserB.id,
      proposedStartTime: '2026-11-10T11:00:00.000Z',
      proposedEndTime: '2026-11-10T11:20:00.000Z',
    });

    if (proposeReschedule.success && patientAccepts.success && patientAccepts.booking?.status === 'confirmed') {
      results.push({ test: 'Reschedule Proposal and Patient Acceptance Flow', status: 'PASSED' });
    } else {
      results.push({ test: 'Reschedule Proposal and Patient Acceptance Flow', status: 'FAILED' });
    }

    // 5. Patient Profile Isolation
    const userABookings = db.getAppointmentsByProfileIds([profileA.id]);
    const userBBookings = db.getAppointmentsByProfileIds([profileB.id]);
    const userAHasB = userABookings.some(a => a.id === apt2.id);
    const userBHasA = userBBookings.some(a => a.id === apt1.id);

    if (!userAHasB && !userBHasA) {
      results.push({ test: 'Patient Data Isolation & Profile Boundary Enforcement', status: 'PASSED' });
    } else {
      results.push({ test: 'Patient Data Isolation & Profile Boundary Enforcement', status: 'FAILED' });
    }

    // 6. Terminal Status Immutability
    // Decline an appointment, then verify no further transitions can occur
    const apt3 = db.createAppointment({
      profileId: profileA.id,
      startTime: '2026-11-12T09:00:00.000Z',
      endTime: '2026-11-12T09:20:00.000Z',
      status: 'pending',
      feeSnapshot: 500,
    });
    executeBookingTransition({
      bookingType: 'appointment',
      bookingId: apt3.id,
      targetStatus: 'declined',
      actorRole: 'staff',
      actorUserId: 'staff-admin-id',
      patientMessage: 'Doctor unavailable.',
    });
    const attemptTransitionFromTerminal = executeBookingTransition({
      bookingType: 'appointment',
      bookingId: apt3.id,
      targetStatus: 'confirmed',
      actorRole: 'staff',
      actorUserId: 'staff-admin-id',
    });

    if (!attemptTransitionFromTerminal.success && attemptTransitionFromTerminal.error?.includes('terminal')) {
      results.push({ test: 'Terminal Status Lockout (No Transitions From Terminal)', status: 'PASSED' });
    } else {
      results.push({ test: 'Terminal Status Lockout (No Transitions From Terminal)', status: 'FAILED' });
    }

    const allPassed = results.every(r => r.status === 'PASSED');

    return NextResponse.json({
      stage: 'Stage 3 — Bookings and Patient Dashboard',
      allPassed,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({
      stage: 'Stage 3 — Bookings and Patient Dashboard',
      allPassed: false,
      error: err.message,
      results,
    }, { status: 500 });
  }
}
