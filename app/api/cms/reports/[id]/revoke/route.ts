import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('reports.revoke')) {
    return NextResponse.json({ error: 'Forbidden: Super Admin or reports.revoke permission required to revoke lab reports.' }, { status: 403 });
  }

  const reportId = params.id;
  const report = db.getLabReportById(reportId);
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (report.status === 'revoked') {
    return NextResponse.json({ error: 'Report is already revoked.' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = (body.reason || '').trim();

  if (!reason) {
    return NextResponse.json({ error: 'Mandatory revoke reason must be provided.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const updated = db.updateLabReport(report.id, {
    status: 'revoked',
    revokedAt: now,
    revokedByStaffId: staff.user.id,
    revokeReason: reason,
  });

  db.addAuditLog({
    actorUserId: staff.user.id,
    actorEmail: staff.user.email,
    actorType: 'staff',
    action: 'report.revoked',
    entityType: 'lab_report',
    entityId: report.id,
    metadataJson: {
      bookingId: report.labBookingId,
      version: report.version,
      revokeReason: reason,
    },
  });

  return NextResponse.json({ success: true, report: updated });
}
