import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

function generateRandomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // non-ambiguous chars
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CL-${p1}-${p2}`;
}

export async function POST(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || (!staff.permissions.includes('patients.manage') && !staff.permissions.includes('bookings.manage'))) {
    return NextResponse.json({ error: 'Forbidden: Missing permissions to generate claim codes.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { profileId } = body;

  if (!profileId) {
    return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
  }

  const profile = db.getPatientProfileById(profileId);
  if (!profile) {
    return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
  }

  // Generate 10-char claim code and hash it
  const rawCode = generateRandomCode();
  const codeHash = crypto.createHash('sha256').update(rawCode.trim().toUpperCase()).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const claim = db.createClaimCode(profile.id, codeHash, expiresAt, staff.user.id);

  db.addAuditLog({
    actorUserId: staff.user.id,
    actorEmail: staff.user.email,
    actorType: 'staff',
    action: 'claim_code.generated',
    entityType: 'patient_profile',
    entityId: profile.id,
    metadataJson: {
      claimCodeId: claim.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    success: true,
    claimCode: rawCode,
    expiresAt,
    profileId: profile.id,
    patientName: profile.fullName,
  });
}
