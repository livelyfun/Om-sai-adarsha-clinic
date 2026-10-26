import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff || !auth.staffPermissions.includes('settings.manage')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { startDate, endDate, reasonEn, reasonNe } = await req.json();
  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
  }

  const closure = db.addClinicClosure({ startDate, endDate, reasonEn, reasonNe });

  recordAudit({
    actorUserId: auth.user.id,
    actorEmail: auth.user.email,
    actorType: 'staff',
    action: 'add_clinic_closure',
    entityType: 'closure',
    entityId: closure.id,
    metadata: { startDate, endDate },
  });

  return NextResponse.json({ success: true, closure });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff || !auth.staffPermissions.includes('settings.manage')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await req.json();
  db.deleteClinicClosure(id);

  recordAudit({
    actorUserId: auth.user.id,
    actorEmail: auth.user.email,
    actorType: 'staff',
    action: 'delete_clinic_closure',
    entityType: 'closure',
    entityId: id,
  });

  return NextResponse.json({ success: true });
}
