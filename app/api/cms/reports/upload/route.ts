import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/auth/guards';
import { reportStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('reports.upload')) {
    return NextResponse.json({ error: 'Forbidden: Missing reports.upload permission' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const labBookingId = (formData.get('labBookingId') as string) || '';
    const confirmation = formData.get('patientConfirmationVerified');
    const isConfirmed = confirmation === 'true';

    // Strict staff verification confirmation checkbox check
    if (!isConfirmed) {
      return NextResponse.json(
        { error: 'Staff confirmation required: You must explicitly verify that this report belongs to this patient and booking.' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!labBookingId) {
      return NextResponse.json({ error: 'Lab booking ID is required' }, { status: 400 });
    }

    const booking = db.getLabBookingById(labBookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Lab booking not found' }, { status: 404 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. File size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 10MB limit (provided ${Math.round(buffer.length / (1024 * 1024))}MB)` },
        { status: 400 }
      );
    }

    // 2. Magic bytes check: must start with %PDF- (hex: 25 50 44 46 2d)
    const magic = buffer.subarray(0, 5).toString('ascii');
    if (magic !== '%PDF-') {
      return NextResponse.json(
        { error: 'Invalid file format: Report file must be a valid PDF starting with %PDF- magic bytes' },
        { status: 400 }
      );
    }

    // 3. Compute SHA-256 Checksum
    const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // 4. Determine report version for this booking
    const existingReports = db.getLabReportsByBookingId(labBookingId);
    const version = existingReports.length + 1;

    // 5. Store file securely
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `reports/${booking.id}/v${version}-${Date.now()}.pdf`;

    await reportStorage.put(storageKey, buffer, {
      originalFilename: sanitizedFilename,
      mimeType: 'application/pdf',
      sizeBytes: buffer.length,
      checksumSha256,
    });

    // 6. Create LabReport record (initial status: draft)
    const now = new Date().toISOString();
    const report = db.createLabReport({
      labBookingId: booking.id,
      profileId: booking.profileId,
      version,
      status: 'draft',
      storageKey,
      originalFilename: sanitizedFilename,
      fileSize: buffer.length,
      checksumSha256,
      mimeType: 'application/pdf',
      uploadedByStaffId: staff.user.id,
      confirmedAt: now,
      confirmedByStaffId: staff.user.id,
      releasedAt: null,
      releasedByStaffId: null,
      revokedAt: null,
      revokedByStaffId: null,
      revokeReason: null,
    });

    // 7. Audit log
    db.addAuditLog({
      actorUserId: staff.user.id,
      actorEmail: staff.user.email,
      actorType: 'staff',
      action: 'report.uploaded',
      entityType: 'lab_report',
      entityId: report.id,
      metadataJson: {
        bookingId: booking.id,
        version,
        filename: sanitizedFilename,
        sizeBytes: buffer.length,
        checksumSha256,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error('Report upload error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
