import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { requireStaffSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('users.manage')) {
    return NextResponse.json({ error: 'Forbidden: Super Admin or users.manage permission required' }, { status: 403 });
  }

  // Find all users who are staff
  const allUsers = (db as any).data.users.filter((u: any) => u.userType === 'staff');
  const staffProfiles = (db as any).data.staffProfiles || [];

  const enriched = allUsers.map((u: any) => {
    const prof = staffProfiles.find((p: any) => p.userId === u.id);
    return {
      id: u.id,
      email: u.email,
      fullName: prof?.fullName || u.email,
      roleId: prof?.roleId || 'reception',
      isActive: u.isActive,
      createdAt: u.createdAt,
    };
  });

  return NextResponse.json({ users: enriched });
}

export async function POST(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('users.manage')) {
    return NextResponse.json({ error: 'Forbidden: Super Admin or users.manage permission required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, password, fullName, roleId = 'reception' } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, and full name are required.' }, { status: 400 });
    }

    const existing = db.getUserByEmail(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const user = db.createUser({
      email: email.toLowerCase(),
      userType: 'staff',
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date().toISOString(),
      preferredLocale: 'en',
    });

    // Create staff profile
    (db as any).data.staffProfiles.push({
      userId: user.id,
      roleId,
      fullName,
      customGrantedPermissions: [],
      customRevokedPermissions: [],
      createdAt: new Date().toISOString(),
    });
    (db as any).save();

    db.addAuditLog({
      actorUserId: staff.user.id,
      actorEmail: staff.user.email,
      actorType: 'staff',
      action: 'staff_user.created',
      entityType: 'user',
      entityId: user.id,
      metadataJson: { email: user.email, roleId },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, fullName, roleId } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
