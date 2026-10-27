export type AuthEmailType = 'verify_email' | 'password_reset' | 'staff_invitation';

export interface SendAuthEmailOptions {
  to: string;
  type: AuthEmailType;
  actionUrl: string;
  recipientName?: string;
}

export interface EmailProviderStatus {
  provider: string;
  status: 'DEVELOPMENT_CONSOLE' | 'CONFIGURED' | 'NOT_CONFIGURED';
}

/**
 * Authentication Email Boundary.
 * Strictly used for account verification, password resets, and staff invitations.
 * Per Section 2 & 6: Never used for booking reminders or automated notifications.
 */
export async function sendAuthEmail(options: SendAuthEmailOptions): Promise<{ success: boolean; messageId?: string }> {
  const isProduction = process.env.APP_ENV === 'production';
  const hasSmtpConfig = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

  if (isProduction && !hasSmtpConfig) {
    // In production without configured SMTP credentials, report NOT CONFIGURED
    console.error(`[AUTH_EMAIL_BOUNDARY] NOT CONFIGURED: Cannot send ${options.type} to ${options.to}. SMTP credentials missing.`);
    return {
      success: false,
      messageId: 'not-configured',
    };
  }

  // In development, securely print action URL to server console for immediate testing
  console.log('----------------------------------------------------');
  console.log(`[AUTH EMAIL - DEV CONSOLE] Type: ${options.type}`);
  console.log(`To: ${options.to}`);
  console.log(`Action URL: ${options.actionUrl}`);
  console.log('----------------------------------------------------');

  return {
    success: true,
    messageId: `dev-${Date.now()}`,
  };
}

export function getEmailProviderStatus(): EmailProviderStatus {
  const isProduction = process.env.APP_ENV === 'production';
  const hasSmtpConfig = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

  if (isProduction && !hasSmtpConfig) {
    return {
      provider: process.env.EMAIL_PROVIDER || 'smtp',
      status: 'NOT_CONFIGURED',
    };
  }

  return {
    provider: hasSmtpConfig ? 'smtp' : 'console-development',
    status: hasSmtpConfig ? 'CONFIGURED' : 'DEVELOPMENT_CONSOLE',
  };
}
