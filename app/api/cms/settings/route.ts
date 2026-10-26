import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = db.getAllSettings();
  const closures = db.getClinicClosures();
  return NextResponse.json({ settings, closures });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!auth.staffPermissions.includes('settings.manage')) {
    return NextResponse.json({ error: 'Forbidden: Missing settings.manage permission' }, { status: 403 });
  }

  try {
    const updates = await req.json();
    db.updateSettings(updates);

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: 'staff',
      action: 'update_clinic_settings',
      entityType: 'settings',
      metadata: { keysUpdated: Object.keys(updates) },
    });

    return NextResponse.json({ success: true, settings: db.getAllSettings() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
