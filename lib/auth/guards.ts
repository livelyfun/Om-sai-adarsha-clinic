import { redirect } from 'next/navigation';
import crypto from 'node:crypto';
import { getAuthContext, AuthContext } from './session';
import { PermissionKey } from '@/lib/db/types';
import { db } from '@/lib/db';

export async function requireStaffAuth(requiredPermission?: PermissionKey): Promise<AuthContext & { user: NonNullable<AuthContext['user']> }> {
  const auth = await getAuthContext();

  if (!auth.user || !auth.isStaff) {
    redirect('/sai-clinic-management/login');
  }

  if (requiredPermission && !auth.staffPermissions.includes(requiredPermission)) {
    throw new Error('FORBIDDEN_PERMISSION_REQUIRED');
  }

  return auth as AuthContext & { user: NonNullable<AuthContext['user']> };
}

export async function requirePatientAuth(requireVerified: boolean = false): Promise<AuthContext & { user: NonNullable<AuthContext['user']> }> {
  const auth = await getAuthContext();

  if (!auth.user || auth.user.userType !== 'patient') {
    redirect('/en/portal/login');
  }

  if (requireVerified && !auth.user.emailVerifiedAt) {
    redirect('/en/portal/verify');
  }

  return auth as AuthContext & { user: NonNullable<AuthContext['user']> };
}

export async function verifyPatientProfileOwnership(profileId: string, userId: string): Promise<boolean> {
  const profile = db.getPatientProfileById(profileId);
  return Boolean(profile && profile.managingUserId === userId);
}

export async function requireStaffSession(req?: any): Promise<{ user: any; permissions: PermissionKey[]; isSuperAdmin: boolean } | null> {
  try {
    const auth = await getAuthContext();
    if (auth.user && auth.isStaff) {
      return {
        user: auth.user,
        permissions: auth.staffPermissions,
        isSuperAdmin: auth.isSuperAdmin,
      };
    }
  } catch {
    // cookies() may throw outside request lifecycle
  }

  // Fallback for API route requests with raw headers
  if (req && typeof req.headers?.get === 'function') {
    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie') || '';
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      const match = cookieHeader.match(/osa_session_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const session = db.getSessionByTokenHash(tokenHash);
      if (session) {
        const user = db.getUserById(session.userId);
        if (user && user.isActive && user.userType === 'staff') {
          const staffPermissions = db.getStaffEffectivePermissions(user.id);
          const staffProfile = db.getStaffProfile(user.id);
          const isSuperAdmin = staffProfile?.roleId === 'super_admin';
          return {
            user,
            permissions: staffPermissions,
            isSuperAdmin,
          };
        }
      }
    }
  }

  return null;
}

export async function getPatientSession(req?: any): Promise<{ user: any } | null> {
  try {
    const auth = await getAuthContext();
    if (auth.user && auth.user.userType === 'patient') {
      return { user: auth.user };
    }
  } catch {
    // cookies() may throw outside request lifecycle
  }

  if (req && typeof req.headers?.get === 'function') {
    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie') || '';
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else {
      const match = cookieHeader.match(/osa_session_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const session = db.getSessionByTokenHash(tokenHash);
      if (session) {
        const user = db.getUserById(session.userId);
        if (user && user.isActive && user.userType === 'patient') {
          return { user };
        }
      }
    }
  }

  return null;
}
