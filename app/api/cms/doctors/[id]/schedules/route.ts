import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const schedules = db.getDoctorSchedules(id);
  const unavailabilities = db.getDoctorUnavailabilities(id);

  return NextResponse.json({ schedules, unavailabilities });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!auth.staffPermissions.includes('catalogue.manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { schedules } = await req.json();

  if (!Array.isArray(schedules)) {
    return NextResponse.json({ error: 'Schedules must be an array' }, { status: 400 });
  }

  db.setDoctorSchedules(id, schedules);

  recordAudit({
    actorUserId: auth.user.id,
    actorEmail: auth.user.email,
    actorType: 'staff',
    action: 'update_doctor_schedule',
    entityType: 'doctor_schedule',
    entityId: id,
    metadata: { count: schedules.length },
  });

  return NextResponse.json({ success: true, schedules: db.getDoctorSchedules(id) });
}
