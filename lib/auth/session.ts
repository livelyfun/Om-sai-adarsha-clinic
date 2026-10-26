import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { User, PermissionKey } from '@/lib/db/types';
import { hashToken, generateRandomToken } from './password';

const SESSION_COOKIE_NAME = 'osa_session_token';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days absolute

export interface AuthContext {
  user: User | null;
  sessionToken: string | null;
  staffPermissions: PermissionKey[];
  isStaff: boolean;
  isSuperAdmin: boolean;
}

/**
 * Creates a server session and sets an HttpOnly, Secure, SameSite=Lax cookie.
 */
export async function createSessionCookie(user: User, reqIp?: string, reqUa?: string): Promise<string> {
  const token = generateRandomToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  db.createSession(user.id, tokenHash, expiresAt, reqIp, reqUa);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return token;
}

/**
 * Destroys the current user session and clears the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    db.deleteSession(tokenHash);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Resolves current authentication context on the server.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return {
      user: null,
      sessionToken: null,
      staffPermissions: [],
      isStaff: false,
      isSuperAdmin: false,
    };
  }

  const tokenHash = hashToken(token);
  const session = db.getSessionByTokenHash(tokenHash);

  if (!session) {
    return {
      user: null,
      sessionToken: null,
      staffPermissions: [],
      isStaff: false,
      isSuperAdmin: false,
    };
  }

  const user = db.getUserById(session.userId);
  if (!user || !user.isActive) {
    // Invalidate invalid/disabled user session
    db.deleteSession(tokenHash);
    return {
      user: null,
      sessionToken: null,
      staffPermissions: [],
      isStaff: false,
      isSuperAdmin: false,
    };
  }

  const isStaff = user.userType === 'staff';
  const staffPermissions = isStaff ? db.getStaffEffectivePermissions(user.id) : [];
  const staffProfile = isStaff ? db.getStaffProfile(user.id) : undefined;
  const isSuperAdmin = staffProfile?.roleId === 'super_admin';

  return {
    user,
    sessionToken: token,
    staffPermissions,
    isStaff,
    isSuperAdmin,
  };
}
