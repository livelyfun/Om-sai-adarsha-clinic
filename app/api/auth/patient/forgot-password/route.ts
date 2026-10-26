import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken, generateRandomToken } from '@/lib/auth/password';
import { sendAuthEmail } from '@/lib/email';
import { recordAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = db.checkRateLimit(`reset_req:${ip}`, 5, 900);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // Generic safe response whether user exists or not (anti-enumeration)
    const user = db.getUserByEmail(email);
    if (user && user.userType === 'patient' && user.isActive) {
      const resetToken = generateRandomToken(32);
      const resetTokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      db.updateUser(user.id, {
        resetTokenHash,
        resetTokenExpiresAt: expiresAt,
      });

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/${user.preferredLocale || 'en'}/portal/reset-password?token=${resetToken}`;

      await sendAuthEmail({
        to: user.email,
        type: 'password_reset',
        actionUrl: resetUrl,
      });

      recordAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorType: 'patient',
        action: 'patient_password_reset_requested',
        entityType: 'user',
        entityId: user.id,
        ipAddress: ip,
      });

      return NextResponse.json({
        success: true,
        message: 'If the email exists, a password reset link has been dispatched.',
        resetUrlDevOnly: process.env.APP_ENV !== 'production' ? resetUrl : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a password reset link has been dispatched.',
    });
  } catch (err: any) {
    console.error('Password reset request error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
