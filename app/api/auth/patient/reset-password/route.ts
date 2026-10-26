import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, hashToken } from '@/lib/auth/password';
import { recordAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);
    const now = new Date().toISOString();
    const allUsers = (db as any).data.users as any[];
    const user = allUsers.find(
      u => u.resetTokenHash === tokenHash && u.resetTokenExpiresAt && u.resetTokenExpiresAt > now
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(newPassword);

    // Update password and clear reset token
    db.updateUser(user.id, {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    });

    // Requirement: A successful reset ends the account's other sessions
    db.deleteAllUserSessions(user.id);

    recordAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorType: 'patient',
      action: 'patient_password_reset_completed',
      entityType: 'user',
      entityId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You may now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('Password reset completion error:', err);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
