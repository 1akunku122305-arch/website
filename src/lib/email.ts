/**
 * Email service abstraction. Honestly reports whether an email provider
 * is configured. Without a configured provider, no email is claimed to be sent.
 */

export interface EmailResult {
  configured: boolean;
  delivered: boolean;
  reason?: string;
}

function isEmailConfigured(): boolean {
  // No provider configured → email integration unavailable.
  return Boolean(process.env.EMAIL_PROVIDER && (process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY));
}

export async function sendEmail(_input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    return { configured: false, delivered: false, reason: 'Layanan email belum dikonfigurasi.' };
  }
  // A real provider (e.g. Resend/SendGrid) would be called here.
  return { configured: true, delivered: false, reason: 'Integrasi email memerlukan konfigurasi provider.' };
}

export const emailConfigured = isEmailConfigured;
