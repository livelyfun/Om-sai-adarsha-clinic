import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { verifyPatientProfileOwnership } from '@/lib/auth/guards';
import { recordAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();

  if (!auth.user || auth.user.userType !== 'patient') {
    return NextResponse.json({ error: 'You must be signed in to submit a lab booking request.' }, { status: 401 });
  }

  if (!auth.user.emailVerifiedAt) {
    return NextResponse.json(
      { error: 'Email verification is required before submitting a lab request.' },
      { status: 403 }
    );
  }

  try {
    const { profileId, testIds, preferredDate, preferredTime, patientNotes } = await req.json();

    if (!profileId || !Array.isArray(testIds) || testIds.length === 0 || !preferredDate || !preferredTime) {
      return NextResponse.json({ error: 'Patient profile, at least one lab test, date, and time are required.' }, { status: 400 });
    }

    const isOwner = await verifyPatientProfileOwnership(profileId, auth.user.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Selected patient profile not found or unauthorized.' }, { status: 404 });
    }

    // Cap open requests
    const maxOpen = db.getSetting('max_open_requests_per_patient') ?? 5;
    const currentOpen = db.countPatientOpenRequests(auth.user.id);
    if (currentOpen >= maxOpen) {
      return NextResponse.json(
        { error: `You have reached the maximum allowed limit of ${maxOpen} open booking requests.` },
        { status: 429 }
      );
    }

    // Validate preferred date & time
    const [hours, minutes] = preferredTime.split(':').map(Number);
    const visitDateTime = new Date(`${preferredDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`);
    const now = Date.now();

    if (isNaN(visitDateTime.getTime()) || visitDateTime.getTime() <= now) {
      return NextResponse.json({ error: 'Requested lab visit time cannot be in the past.' }, { status: 400 });
    }

    // Snapshot selected tests
    const lineItems: any[] = [];
    let estimatedTotal = 0;

    for (const testId of testIds) {
      const test = db.getLabTestById(testId);
      if (!test || !test.isActive) continue;

      lineItems.push({
        labTestId: test.id,
        nameEnSnapshot: test.nameEn,
        nameNeSnapshot: test.nameNe || test.nameEn,
        priceSnapshot: test.price,
        prepInstructionsSnapshot: test.prepInstructionsEn || '',
      });

      if (typeof test.price === 'number') {
        estimatedTotal += test.price;
      }
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'None of the selected tests are currently available.' }, { status: 400 });
    }

    // Create Lab Booking
    const { booking, items } = db.createLabBooking(
      {
        profileId,
        preferredTime: visitDateTime.toISOString(),
        status: 'pending',
        estimatedTotal,
        patientNotes: patientNotes || '',
      },
      lineItems
    );

    // Initial event
    db.addBookingStatusEvent({
      bookingType: 'lab',
      bookingId: booking.id,
      fromStatus: 'none',
      toStatus: 'pending',
      actorType: 'patient',
      actorUserId: auth.user.id,
      patientMessage: 'Lab investigation request submitted.',
    });

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: 'patient',
      action: 'submit_lab_request',
      entityType: 'lab_booking',
      entityId: booking.id,
      metadata: { referenceNo: booking.referenceNo, itemCount: items.length },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        referenceNo: booking.referenceNo,
        status: booking.status,
        preferredTime: booking.preferredTime,
        estimatedTotal: booking.estimatedTotal,
        itemsCount: items.length,
      },
    });
  } catch (err: any) {
    console.error('Lab booking submission error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit lab request' }, { status: 500 });
  }
}
