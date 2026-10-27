import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, hashToken, generateRandomToken } from '@/lib/auth/password';
import { sendAuthEmail } from '@/lib/email';
import { recordAudit } from '@/lib/audit';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Mobile phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  termsConsent: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  preferredLocale: z.enum(['en', 'ne']).default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Rate limit registration by IP (max 5 per 15 minutes)
    const rateCheck = db.checkRateLimit(`reg:${ip}`, 5, 900);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password, preferredLocale } = parsed.data;

    // Check if user already exists (do not leak enumeration to the client, but handle internally)
    const existing = db.getUserByEmail(email);
    if (existing) {
      // Return safe message without exposing whether email exists
      return NextResponse.json({
        success: true,
        message: 'Registration received. If this email is not already registered, a verification link has been sent.',
      });
    }

    // Hash password & generate verification token
    const passwordHash = hashPassword(password);
    const verificationToken = generateRandomToken(32);
    const verificationTokenHash = hashToken(verificationToken);

    const hasSmtpConfig = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    const user = db.createUser({
      email,
      phone,
      passwordHash,
      userType: 'patient',
      isActive: true,
      emailVerifiedAt: hasSmtpConfig ? null : new Date().toISOString(),
      verificationTokenHash,
      preferredLocale,
    });

    // Create primary patient profile for "myself"
    db.createPatientProfile({
      managingUserId: user.id,
      fullName,
      phone,
      relationshipLabel: 'myself',
    });

    // Send verification email via email boundary
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/${preferredLocale}/portal/verify?token=${verificationToken}`;

    await sendAuthEmail({
      to: email,
      type: 'verify_email',
      actionUrl: verifyUrl,
      recipientName: fullName,
    });

    // Record Audit
    recordAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      actorType: 'patient',
      action: 'patient_registration',
      entityType: 'user',
      entityId: user.id,
      ipAddress: ip,
      metadata: { termsVersion: '2026-10-v1', preferredLocale },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful. A verification link has been sent to your email.',
      verificationUrlDevOnly: process.env.APP_ENV !== 'production' ? verifyUrl : undefined,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
