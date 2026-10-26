import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { executeBookingTransition } from '@/lib/bookings/state-machine';
import { db } from '@/lib/db';
import { verifyPatientProfileOwnership } from '@/lib/auth/guards';
import { recordAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bookingType, bookingId, targetStatus, patientMessage, internalNote, proposedStartTime, proposedEndTime } = body;

    if (!bookingType || !bookingId || !targetStatus) {
      return NextResponse.json({ error: 'bookingType, bookingId, and targetStatus are required.' }, { status: 400 });
    }

    const booking = bookingType === 'appointment' ? db.getAppointmentById(bookingId) : db.getLabBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    let actorRole: 'patient' | 'staff' = 'patient';

    if (auth.isStaff) {
      actorRole = 'staff';
      if (!auth.staffPermissions.includes('bookings.manage')) {
        return NextResponse.json({ error: 'Forbidden: Missing bookings.manage permission' }, { status: 403 });
      }
    } else {
      // Patient transition: Verify ownership of this booking's profile!
      const isOwner = await verifyPatientProfileOwnership(booking.profileId, auth.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Booking not found or access denied.' }, { status: 404 });
      }
      actorRole = 'patient';
    }

    const result = executeBookingTransition({
      bookingType,
      bookingId,
      targetStatus,
      actorRole,
      actorUserId: auth.user.id,
      patientMessage,
      internalNote,
      proposedStartTime,
      proposedEndTime,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: actorRole,
      action: `booking_transition_${targetStatus}`,
      entityType: bookingType,
      entityId: bookingId,
      metadata: { from: booking.status, to: targetStatus, referenceNo: booking.referenceNo },
    });

    return NextResponse.json({ success: true, booking: result.booking });
  } catch (err: any) {
    console.error('Transition error:', err);
    return NextResponse.json({ error: err.message || 'Status transition failed' }, { status: 500 });
  }
}
