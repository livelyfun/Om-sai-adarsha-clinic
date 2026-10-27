import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { User, PermissionKey } from '@/lib/db/types';
import { hashToken, generateRandomToken } from './password';

const SESSION_COOKIE_NAME = 'osa_session_token';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days absolute
const FALLBACK_SECRET = 'osa_clinic_default_session_secret_key_32_bytes_min_2026';

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || FALLBACK_SECRET;
}

export interface AuthContext {
  user: User | null;
  sessionToken: string | null;
  staffPermissions: PermissionKey[];
  isStaff: boolean;
  isSuperAdmin: boolean;
}

/**
 * Creates a server session and sets an HttpOnly, Secure, SameSite=Lax cookie.
 * In serverless deployments (Vercel), uses a cryptographically signed HMAC-SHA256
 * token payload so sessions seamlessly survive across stateless lambda containers.
 */
export async function createSessionCookie(user: User, reqIp?: string, reqUa?: string): Promise<string> {
  const rawToken = generateRandomToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  // Record session in database store
  try {
    db.createSession(user.id, tokenHash, expiresAt, reqIp, reqUa);
  } catch (err) {
    console.warn('Session DB record warning (non-fatal for stateless tokens):', err);
  }

  // Create signed payload for stateless verification across lambdas
  const payload = {
    uid: user.id,
    eml: user.email,
    typ: user.userType,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    tok: rawToken,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = getSessionSecret();
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const signedToken = `${payloadB64}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return signedToken;
}

/**
 * Destroys the current user session and clears the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (cookieVal) {
    let rawToken = cookieVal;
    if (cookieVal.includes('.')) {
      try {
        const [payloadB64] = cookieVal.split('.');
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
        if (payload.tok) rawToken = payload.tok;
      } catch {
        // ignore parse error
      }
    }
    const tokenHash = hashToken(rawToken);
    try {
      db.deleteSession(tokenHash);
    } catch {
      // ignore
    }
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Resolves current authentication context on the server.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const emptyAuth: AuthContext = {
    user: null,
    sessionToken: null,
    staffPermissions: [],
    isStaff: false,
    isSuperAdmin: false,
  };

  if (!cookieVal) {
    return emptyAuth;
  }

  let resolvedUserId: string | null = null;
  let activeToken: string = cookieVal;

  // 1. Verify signed token format (base64urlPayload.signature)
  if (cookieVal.includes('.')) {
    const parts = cookieVal.split('.');
    if (parts.length === 2) {
      const [payloadB64, sig] = parts;
      const secret = getSessionSecret();
      const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

      if (sig.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        try {
          const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
          if (payload.exp && payload.exp > Date.now() && payload.uid) {
            resolvedUserId = payload.uid;
            activeToken = payload.tok || cookieVal;
          }
        } catch {
          // invalid JSON payload
        }
      }
    }
  }

  // 2. Fallback to DB session lookup if signed format was not used
  if (!resolvedUserId) {
    const tokenHash = hashToken(cookieVal);
    const session = db.getSessionByTokenHash(tokenHash);
    if (session) {
      resolvedUserId = session.userId;
      activeToken = cookieVal;
    }
  }

  if (!resolvedUserId) {
    return emptyAuth;
  }

  const user = db.getUserById(resolvedUserId);
  if (!user || !user.isActive) {
    // Invalidate invalid/disabled user session
    return emptyAuth;
  }

  const isStaff = user.userType === 'staff';
  const staffPermissions = isStaff ? db.getStaffEffectivePermissions(user.id) : [];
  const staffProfile = isStaff ? db.getStaffProfile(user.id) : undefined;
  const isSuperAdmin = staffProfile?.roleId === 'super_admin';

  return {
    user,
    sessionToken: activeToken,
    staffPermissions,
    isStaff,
    isSuperAdmin,
  };
}

export const getLegacyAuthContext = getAuthContext;
