import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : process.env.BETTER_AUTH_URL || process.env.APP_URL || 'http://localhost:3000',
});

// Export individual methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;

// Typed wrappers for password reset / email verification
// These call the Better Auth REST endpoints directly using the client's $fetch
export async function forgetPassword(opts: { email: string; redirectTo: string }) {
  return authClient.$fetch('/request-password-reset', {
    method: 'POST',
    body: { email: opts.email, redirectTo: opts.redirectTo },
  });
}

export async function resetPassword(opts: { newPassword: string; token: string }) {
  return authClient.$fetch('/reset-password', {
    method: 'POST',
    body: { newPassword: opts.newPassword, token: opts.token },
  });
}

export async function verifyEmail(opts: { token: string }) {
  return authClient.$fetch('/verify-email', {
    method: 'GET',
    query: { token: opts.token },
  });
}

export async function sendVerificationEmail(opts: { email: string }) {
  return authClient.$fetch('/send-verification-email', {
    method: 'POST',
    body: { email: opts.email },
  });
}
