import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('reports.view')) {
    return NextResponse.json({ error: 'Forbidden: Missing reports.view permission' }, { status: 403 });
  }

  const reports = db.getAllLabReports();
  const enriched = reports.map(r => {
    const booking = db.getLabBookingById(r.labBookingId);
    const profile = db.getPatientProfileById(r.profileId);
    const items = db.getLabBookingItems(r.labBookingId);
    return {
      ...r,
      referenceNo: booking?.referenceNo || 'N/A',
      patientName: profile?.fullName || 'Unknown',
      relationshipLabel: profile?.relationshipLabel || 'patient',
      tests: items.map(i => i.nameEnSnapshot).join(', ') || 'Lab Tests',
    };
  });

  return NextResponse.json({
    reports: enriched,
    canRelease: staff.permissions.includes('reports.release'),
    canRevoke: staff.permissions.includes('reports.revoke'),
    canUpload: staff.permissions.includes('reports.upload'),
  });
}
