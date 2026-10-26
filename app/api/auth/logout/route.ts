import { NextResponse } from 'next/server';
import { getAuthContext, destroySession } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';

export async function POST() {
  try {
    const auth = await getAuthContext();

    if (auth.user) {
      recordAudit({
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorType: auth.isStaff ? 'staff' : 'patient',
        action: 'user_logout',
        entityType: 'session',
        entityId: auth.user.id,
      });
    }

    await destroySession();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
