import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionCookie } from '@/lib/auth/session';
import { recordAudit } from '@/lib/audit';

const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = req.headers.get('user-agent') || '';

    const body = await req.json();
    const parsed = staffLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const rateKey = `login:staff:${ip}:${email.toLowerCase()}`;
    const rateCheck = db.checkRateLimit(rateKey, 5, 600); // 5 attempts per 10 min

    if (!rateCheck.allowed) {
      recordAudit({
        actorEmail: email,
        actorType: 'anonymous',
        action: 'staff_login_rate_limited',
        entityType: 'cms_auth',
        ipAddress: ip,
      });
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const user = db.getUserByEmail(email);

    // Section 6 & 9: Patient accounts can NEVER access the CMS
    if (!user || user.userType !== 'staff' || !verifyPassword(password, user.passwordHash)) {
      recordAudit({
        actorEmail: email,
        actorType: 'anonymous',
        action: 'staff_login_failed',
        entityType: 'cms_auth',
        ipAddress: ip,
      });
      return NextResponse.json(
        { error: 'Invalid credentials or unauthorized.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      recordAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        actorType: 'staff',
        action: 'staff_login_disabled_account_attempt',
        entityType: 'cms_auth',
        ipAddress: ip,
      });
      return NextResponse.json(
        { error: 'Account has been disabled. Please contact Super Admin.' },
        { status: 403 }
      );
    }

    // Set HttpOnly session cookie
    await createSessionCookie(user, ip, ua);

    recordAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorType: 'staff',
      action: 'staff_login_success',
      entityType: 'cms_session',
      entityId: user.id,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err: any) {
    console.error('Staff login error:', err);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
