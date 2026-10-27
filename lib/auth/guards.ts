import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from './auth';
import { db } from '@/lib/db';
import { PermissionKey } from '@/lib/db/types';

// Better Auth session shape from server
type BetterAuthSession = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
} | null;

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerifiedAt: string | null;
    userType: string;
    isActive: boolean;
    preferredLocale: string;
  } | null;
  sessionToken: string | null;
  staffPermissions: PermissionKey[];
  isStaff: boolean;
  isSuperAdmin: boolean;
}

/**
 * Get the current Better Auth session server-side.
 */
async function getBetterAuthSession(): Promise<BetterAuthSession> {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });
    return session as BetterAuthSession;
  } catch {
    return null;
  }
}

/**
 * Get auth context from Better Auth session.
 * Maps Better Auth user to the app's AuthContext shape.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const empty: AuthContext = {
    user: null,
    sessionToken: null,
    staffPermissions: [],
    isStaff: false,
    isSuperAdmin: false,
  };

  const session = await getBetterAuthSession();
  if (!session?.user) return empty;

  const betterUser = session.user;

  // Determine user type — Better Auth stores it in the `user` table via additionalFields.
  // We check if this user is a staff member in the legacy db system or default to 'patient'.
  const legacyUser = db.getUserByEmail(betterUser.email);

  const userType = (betterUser as any).userType || legacyUser?.userType || 'patient';
  const isActive = legacyUser ? legacyUser.isActive : true;
  const preferredLocale = (betterUser as any).preferredLocale || legacyUser?.preferredLocale || 'en';

  const mappedUser = {
    id: betterUser.id,
    email: betterUser.email,
    name: betterUser.name,
    emailVerifiedAt: betterUser.emailVerified ? new Date().toISOString() : null,
    userType,
    isActive,
    preferredLocale,
  };

  const isStaff = userType === 'staff';
  const staffPermissions = isStaff ? db.getStaffEffectivePermissions(betterUser.id) : [];
  const staffProfile = isStaff ? db.getStaffProfile(betterUser.id) : undefined;
  const isSuperAdmin = staffProfile?.roleId === 'super_admin';

  return {
    user: mappedUser,
    sessionToken: session.session.token,
    staffPermissions,
    isStaff,
    isSuperAdmin,
  };
}

/**
 * Requires patient authentication. Redirects to login if not authenticated.
 */
export async function requirePatientAuth(
  requireVerified: boolean = false,
  locale: string = 'en'
): Promise<AuthContext & { user: NonNullable<AuthContext['user']> }> {
  const authCtx = await getAuthContext();

  if (!authCtx.user) {
    redirect(`/${locale}/portal/login`);
  }

  if (requireVerified && !authCtx.user.emailVerifiedAt) {
    redirect(`/${locale}/portal/verify`);
  }

  return authCtx as AuthContext & { user: NonNullable<AuthContext['user']> };
}

/**
 * Requires staff authentication. Redirects to staff login if not authenticated.
 */
export async function requireStaffAuth(requiredPermission?: PermissionKey): Promise<AuthContext & { user: NonNullable<AuthContext['user']> }> {
  const authCtx = await getAuthContext();

  if (!authCtx.user || !authCtx.isStaff) {
    redirect('/sai-clinic-management/login');
  }

  if (requiredPermission && !authCtx.staffPermissions.includes(requiredPermission)) {
    throw new Error('FORBIDDEN_PERMISSION_REQUIRED');
  }

  return authCtx as AuthContext & { user: NonNullable<AuthContext['user']> };
}

/**
 * Verifies patient profile ownership.
 */
export async function verifyPatientProfileOwnership(profileId: string, userId: string): Promise<boolean> {
  const profile = db.getPatientProfileById(profileId);
  return Boolean(profile && profile.managingUserId === userId);
}

/**
 * Returns staff session info or null (non-throwing helper for API routes).
 */
export async function requireStaffSession(req?: any): Promise<{ user: any; permissions: PermissionKey[]; isSuperAdmin: boolean } | null> {
  try {
    const authCtx = await getAuthContext();
    if (authCtx.user && authCtx.isStaff) {
      return {
        user: authCtx.user,
        permissions: authCtx.staffPermissions,
        isSuperAdmin: authCtx.isSuperAdmin,
      };
    }
  } catch {
    // outside request lifecycle
  }
  return null;
}

/**
 * Returns patient session info or null (non-throwing helper for API routes).
 */
export async function getPatientSession(req?: any): Promise<{ user: any } | null> {
  try {
    const authCtx = await getAuthContext();
    if (authCtx.user && authCtx.user.userType === 'patient') {
      return { user: authCtx.user };
    }
  } catch {
    // outside request lifecycle
  }
  return null;
}
