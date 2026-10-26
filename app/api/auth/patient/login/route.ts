import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionCookie } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = req.headers.get('user-agent') || '';

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'The email or password provided is incorrect.' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const rateKey = `login:patient:${ip}:${email.toLowerCase()}`;
    const rateCheck = db.checkRateLimit(rateKey, 5, 600); // 5 attempts per 10 minutes

    if (!rateCheck.allowed) {
      recordAudit({
        actorEmail: email,
        actorType: 'anonymous',
        action: 'patient_login_rate_limited',
        entityType: 'auth',
        ipAddress: ip,
      });
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again after 10 minutes.' },
        { status: 429 }
      );
    }

    const user = db.getUserByEmail(email);

    // Constant-time failure response to prevent account enumeration
    if (!user || user.userType !== 'patient' || !verifyPassword(password, user.passwordHash)) {
      recordAudit({
        actorEmail: email,
        actorType: 'anonymous',
        action: 'patient_login_failed',
        entityType: 'auth',
        ipAddress: ip,
      });
      return NextResponse.json(
        { error: 'The email or password provided is incorrect.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      recordAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorType: 'patient',
        action: 'patient_login_disabled_account_blocked',
        entityType: 'auth',
        ipAddress: ip,
      });
      return NextResponse.json(
        { error: 'This account has been disabled. Please contact clinic reception.' },
        { status: 403 }
      );
    }

    // Create session & set HttpOnly cookie
    await createSessionCookie(user, ip, ua);

    recordAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorType: 'patient',
      action: 'patient_login_success',
      entityType: 'session',
      entityId: user.id,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: Boolean(user.emailVerifiedAt),
        preferredLocale: user.preferredLocale,
      },
    });
  } catch (err: any) {
    console.error('Patient login error:', err);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
