import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/auth/password';
import { recordAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const user = db.getUserByVerificationTokenHash(tokenHash);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token.' },
        { status: 400 }
      );
    }

    // Mark email verified and clear token
    db.updateUser(user.id, {
      emailVerifiedAt: new Date().toISOString(),
      verificationTokenHash: null,
    });

    recordAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorType: 'patient',
      action: 'patient_email_verified',
      entityType: 'user',
      entityId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully. You may now submit booking requests.',
    });
  } catch (err: any) {
    console.error('Email verification error:', err);
    return NextResponse.json({ error: 'Failed to verify email.' }, { status: 500 });
  }
}
