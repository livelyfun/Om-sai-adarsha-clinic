import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { getPatientSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getPatientSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Authentication required to claim patient records.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const rawCode = (body.code || '').trim().toUpperCase();

  if (!rawCode) {
    return NextResponse.json({ error: 'Claim code is required.' }, { status: 400 });
  }

  const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');
  const claim = db.findValidClaimCode(codeHash);

  if (!claim) {
    return NextResponse.json(
      { error: 'Invalid, expired, or already claimed code. Please contact clinic reception.' },
      { status: 400 }
    );
  }

  const profile = db.getPatientProfileById(claim.profileId);
  if (!profile) {
    return NextResponse.json({ error: 'Associated patient profile not found.' }, { status: 404 });
  }

  // Check 6-profile account limit
  const currentProfiles = db.getPatientProfilesByUser(session.user.id);
  if (currentProfiles.length >= 6) {
    return NextResponse.json(
      { error: 'Maximum limit of 6 family profiles reached on your account.' },
      { status: 400 }
    );
  }

  // Check if profile is already claimed by someone else
  if (profile.managingUserId && profile.managingUserId !== session.user.id) {
    return NextResponse.json(
      { error: 'This patient profile has already been claimed by another account. Please contact reception.' },
      { status: 409 }
    );
  }

  // Link profile to this patient user
  const updatedProfile = db.updatePatientProfile(profile.id, {
    managingUserId: session.user.id,
  });

  // Mark claim code as used
  db.markClaimCodeUsed(claim.id);

  // Audit log
  db.addAuditLog({
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    actorType: 'patient',
    action: 'claim_code.redeemed',
    entityType: 'patient_profile',
    entityId: profile.id,
    metadataJson: {
      claimCodeId: claim.id,
      patientName: profile.fullName,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Patient profile '${profile.fullName}' has been successfully linked to your account!`,
    profile: updatedProfile,
  });
}
