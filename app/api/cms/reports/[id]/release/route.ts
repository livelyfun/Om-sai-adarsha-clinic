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
  if (!staff || !staff.permissions.includes('reports.release')) {
    return NextResponse.json({ error: 'Forbidden: Super Admin or reports.release permission required to release lab reports.' }, { status: 403 });
  }

  const reportId = params.id;
  const report = db.getLabReportById(reportId);
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  if (report.status !== 'draft') {
    return NextResponse.json({ error: `Cannot release report: current status is '${report.status}'. Only draft reports can be released.` }, { status: 400 });
  }

  // Supersede previous released reports for this lab booking
  db.supersedePreviousReports(report.labBookingId, report.id);

  const now = new Date().toISOString();
  const updated = db.updateLabReport(report.id, {
    status: 'released',
    releasedAt: now,
    releasedByStaffId: staff.user.id,
  });

  db.addAuditLog({
    actorUserId: staff.user.id,
    actorEmail: staff.user.email,
    actorType: 'staff',
    action: 'report.released',
    entityType: 'lab_report',
    entityId: report.id,
    metadataJson: {
      bookingId: report.labBookingId,
      version: report.version,
    },
  });

  return NextResponse.json({ success: true, report: updated });
}
