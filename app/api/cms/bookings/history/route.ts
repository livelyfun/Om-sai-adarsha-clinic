import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Booking id required' }, { status: 400 });
  }

  const events = db.getBookingStatusEvents(id);
  return NextResponse.json({ events });
}
