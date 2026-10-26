import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth.user || auth.user.userType !== 'patient') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profiles = db.getPatientProfilesByUser(auth.user.id);
  return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user || auth.user.userType !== 'patient') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fullName, dob, sex, phone, relationshipLabel } = await req.json();
    if (!fullName || !relationshipLabel) {
      return NextResponse.json({ error: 'Full name and relationship label are required.' }, { status: 400 });
    }

    // Cap profiles per account (default 6 per Section 6)
    const existing = db.getPatientProfilesByUser(auth.user.id);
    if (existing.length >= 6) {
      return NextResponse.json({ error: 'Maximum of 6 patient profiles reached for this account.' }, { status: 400 });
    }

    const newProfile = db.createPatientProfile({
      managingUserId: auth.user.id,
      fullName: fullName.trim(),
      dob: dob || undefined,
      sex: sex || undefined,
      phone: phone || undefined,
      relationshipLabel: relationshipLabel.trim().toLowerCase(),
    });

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: 'patient',
      action: 'create_family_profile',
      entityType: 'patient_profile',
      entityId: newProfile.id,
      metadata: { relationship: newProfile.relationshipLabel },
    });

    return NextResponse.json({ success: true, profile: newProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create profile' }, { status: 500 });
  }
}
