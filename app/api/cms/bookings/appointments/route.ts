import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff || !auth.staffPermissions.includes('bookings.view')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appointments = db.getAllAppointments();
  return NextResponse.json({ appointments });
}
