import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('audit.view')) {
    return NextResponse.json({ error: 'Forbidden: Super Admin or audit.view permission required' }, { status: 403 });
  }

  const logs = db.getAuditLogs(200);

  return NextResponse.json({ logs });
}
