import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { db } from '@/lib/db';
import { getPatientSession, requireStaffSession } from '@/lib/auth/guards';
import { reportStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const reportId = params.id;
  const report = db.getLabReportById(reportId);

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // 1. Check if caller is Staff
  const staff = await requireStaffSession(req);
  let isAuthorized = false;
  let actorType: 'staff' | 'patient' = 'staff';
  let actorUserId: string | null = null;
  let actorEmail: string | null = null;

  if (staff && staff.permissions.includes('reports.view')) {
    isAuthorized = true;
    actorType = 'staff';
    actorUserId = staff.user.id;
    actorEmail = staff.user.email;
  } else {
    // 2. Check if caller is Patient
    const patientSession = await getPatientSession(req);
    if (!patientSession) {
      return NextResponse.json({ error: 'Authentication required to download lab reports.' }, { status: 401 });
    }

    const patientProfiles = db.getPatientProfilesByUser(patientSession.user.id);
    const ownsProfile = patientProfiles.some(p => p.id === report.profileId);

    if (!ownsProfile) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view or download this report.' }, { status: 403 });
    }

    // Patient access rules based on lifecycle status
    if (report.status === 'draft') {
      return NextResponse.json({ error: 'Report is currently in draft review and has not yet been released.' }, { status: 404 });
    }

    if (report.status === 'revoked') {
      return NextResponse.json(
        {
          error: 'This laboratory report has been revoked by the clinic.',
          reason: report.revokeReason || 'Administrative revocation',
          revokedAt: report.revokedAt,
        },
        { status: 403 }
      );
    }

    isAuthorized = true;
    actorType = 'patient';
    actorUserId = patientSession.user.id;
    actorEmail = patientSession.user.email;
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const nodeStream = await reportStorage.openStream(report.storageKey);
    // Convert Node Readable to Web ReadableStream
    const webStream = Readable.toWeb(nodeStream);

    // Record audit log entry
    db.addAuditLog({
      actorUserId,
      actorEmail,
      actorType,
      action: 'report.downloaded',
      entityType: 'lab_report',
      entityId: report.id,
      metadataJson: {
        filename: report.originalFilename,
        version: report.version,
        status: report.status,
      },
    });

    return new Response(webStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.originalFilename}"`,
        'Cache-Control': 'private, no-store',
        'X-Report-Version': String(report.version),
        'X-Report-Status': report.status,
      },
    });
  } catch (err: any) {
    console.error('Failed to stream report file:', err);
    return NextResponse.json({ error: 'Unable to read report file from storage.' }, { status: 500 });
  }
}
