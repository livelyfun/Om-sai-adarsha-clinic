import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || (!staff.permissions.includes('patients.view') && !staff.permissions.includes('bookings.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const profiles = db.getAllPatientProfiles();
  const allUsers = (db as any).data.users || [];

  const profilesWithMetadata = profiles.map(p => {
    const managingUser = p.managingUserId ? allUsers.find((u: any) => u.id === p.managingUserId) : null;
    const appointments = db.getAppointmentsByProfileIds([p.id]);
    const labBookings = db.getLabBookingsByProfileIds([p.id]);
    const reports = db.getLabReportsByProfileIds([p.id]);

    return {
      ...p,
      isLinked: Boolean(p.managingUserId),
      managingUserEmail: managingUser?.email || null,
      appointmentsCount: appointments.length,
      labBookingsCount: labBookings.length,
      reportsCount: reports.length,
    };
  });

  return NextResponse.json({
    profiles: profilesWithMetadata,
    canManage: staff.permissions.includes('patients.manage'),
  });
}

export async function POST(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('patients.manage')) {
    return NextResponse.json({ error: 'Forbidden: Missing patients.manage permission' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { fullName, dateOfBirth, sex, phone, address, bloodGroup } = body;

  if (!fullName || !fullName.trim()) {
    return NextResponse.json({ error: 'Patient full name is required' }, { status: 400 });
  }

  const newProfile = db.createPatientProfile({
    managingUserId: null, // Unlinked walk-in patient profile
    fullName: fullName.trim(),
    relationshipLabel: 'self',
    dob: dateOfBirth || undefined,
    sex: sex || 'other',
    phone: phone || undefined,
  });

  db.addAuditLog({
    actorUserId: staff.user.id,
    actorEmail: staff.user.email,
    actorType: 'staff',
    action: 'patient_profile.created',
    entityType: 'patient_profile',
    entityId: newProfile.id,
    metadataJson: {
      fullName: newProfile.fullName,
      isWalkIn: true,
    },
  });

  return NextResponse.json({
    success: true,
    profile: newProfile,
  });
}
