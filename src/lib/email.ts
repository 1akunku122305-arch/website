/**
 * Email service abstraction.
 *
 * Providers (configured exclusively via environment variables — never
 * hard-coded, never exposed to the browser):
 *
 *   EMAIL_PROVIDER=resend  → Resend REST API (serverless-friendly, no deps)
 *   EMAIL_PROVIDER=smtp    → SMTP via nodemailer (dynamically imported)
 *   (empty)                → "not configured": no email is claimed to be sent.
 *
 * Every send path reports honestly whether the message was actually accepted
 * by the provider; SMTP/API failures never crash the caller.
 */

export interface EmailResult {
  configured: boolean;
  delivered: boolean;
  reason?: string;
}

type EmailProvider = 'resend' | 'smtp' | 'none';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'WangStore';

function getProvider(): EmailProvider {
  const provider = (process.env.EMAIL_PROVIDER ?? '').trim().toLowerCase();
  if (provider === 'resend') {
    return process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY ? 'resend' : 'none';
  }
  if (provider === 'smtp') {
    return process.env.SMTP_HOST ? 'smtp' : 'none';
  }
  return 'none';
}

export function emailConfigured(): boolean {
  return getProvider() !== 'none';
}

/** Resolve the envelope `from` (honours a display name when provided). */
function fromAddress(): string {
  const from = (process.env.EMAIL_FROM ?? '').trim();
  const name = (process.env.EMAIL_FROM_NAME ?? SITE_NAME).trim();
  if (!from) return `${name} <no-reply@localhost>`;
  if (from.includes('<')) return from;
  return name ? `${name} <${from}>` : from;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ------------------------------------------------------------------ *
 * HTML email templates (responsive, inline-styled, no external assets)
 * ------------------------------------------------------------------ */

interface LayoutInput {
  preheader: string;
  bodyHtml: string;
  cta?: { url: string; label: string };
  altText?: string;
  footerNote?: string;
}

function renderEmailLayout({ preheader, bodyHtml, cta, altText, footerNote }: LayoutInput): string {
  const siteName = escapeHtml(SITE_NAME);
  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<title>${siteName}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
          <tr>
            <td style="background-color:#111111;padding:24px 32px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.2px;">${siteName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#171717;font-size:15px;line-height:1.6;">
              ${bodyHtml}
              ${cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="border-radius:8px;background-color:#111111;">
                    <a href="${escapeHtml(cta.url)}" target="_blank" rel="noopener"
                       style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${escapeHtml(cta.label)}</a>
                  </td>
                </tr>
              </table>` : ''}
              ${altText ? `<p style="margin:20px 0 0;font-size:13px;color:#737373;word-break:break-all;"><strong style="color:#525252;">Tautan alternatif:</strong><br /><a href="${escapeHtml(altText)}" style="color:#525252;text-decoration:underline;">${escapeHtml(altText)}</a></p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0f0f0;background-color:#fafafa;color:#a3a3a3;font-size:12px;line-height:1.5;">
              ${footerNote ? `<p style="margin:0 0 8px;">${footerNote}</p>` : ''}
              <p style="margin:0;">© ${new Date().getFullYear()} ${siteName}. Email ini dikirim otomatis oleh sistem, mohon tidak membalas.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface VerificationEmailData {
  userName: string;
  verifyUrl: string;
  ttlMinutes: number;
}

export function renderVerificationEmail({ userName, verifyUrl, ttlMinutes }: VerificationEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const siteName = SITE_NAME;
  const bodyHtml = `
    <p style="margin:0 0 16px;">Halo <strong>${escapeHtml(userName)}</strong>,</p>
    <p style="margin:0 0 16px;">Anda baru saja mendaftarkan akun di <strong>${escapeHtml(siteName)}</strong>. Untuk mengaktifkan akun dan mengakses seluruh fitur, silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini.</p>
    <p style="margin:0 0 16px;">Tautan verifikasi berlaku selama <strong>${ttlMinutes} menit</strong> dan hanya dapat digunakan <strong>satu kali</strong>.</p>`;
  const text = `Halo ${userName},\n\nAnda baru saja mendaftarkan akun di ${siteName}. Untuk mengaktifkan akun, buka tautan verifikasi berikut:\n\n${verifyUrl}\n\nTautan berlaku selama ${ttlMinutes} menit dan hanya dapat digunakan satu kali.\n\nJika Anda tidak merasa melakukan pendaftaran, abaikan email ini.`;
  return {
    subject: `Verifikasi Email Anda — ${siteName}`,
    html: renderEmailLayout({
      preheader: `Aktifkan akun ${siteName} Anda dalam satu langkah.`,
      bodyHtml,
      cta: { url: verifyUrl, label: 'Verifikasi Email Saya' },
      altText: verifyUrl,
      footerNote: 'Jika Anda tidak merasa melakukan registrasi, Anda dapat mengabaikan email ini. Akun tanpa verifikasi tidak akan memiliki akses penuh.',
    }),
    text,
  };
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  ttlMinutes: number;
}

export function renderPasswordResetEmail({ userName, resetUrl, ttlMinutes }: PasswordResetEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const siteName = SITE_NAME;
  const bodyHtml = `
    <p style="margin:0 0 16px;">Halo <strong>${escapeHtml(userName)}</strong>,</p>
    <p style="margin:0 0 16px;">Kami menerima permintaan untuk mereset kata sandi akun ${escapeHtml(siteName)} Anda. Klik tombol di bawah untuk membuat kata sandi baru.</p>
    <p style="margin:0 0 16px;">Tautan reset berlaku selama <strong>${ttlMinutes} menit</strong> dan hanya dapat digunakan <strong>satu kali</strong>.</p>`;
  const text = `Halo ${userName},\n\nKami menerima permintaan reset kata sandi akun ${siteName} Anda. Buka tautan berikut untuk membuat kata sandi baru:\n\n${resetUrl}\n\nTautan berlaku selama ${ttlMinutes} menit dan hanya dapat digunakan satu kali.\n\nJika Anda tidak meminta reset kata sandi, abaikan email ini dan kata sandi Anda tidak akan berubah.`;
  return {
    subject: `Reset Kata Sandi — ${siteName}`,
    html: renderEmailLayout({
      preheader: `Buat kata sandi baru untuk akun ${siteName} Anda.`,
      bodyHtml,
      cta: { url: resetUrl, label: 'Reset Kata Sandi' },
      altText: resetUrl,
      footerNote: 'Jika Anda tidak meminta reset kata sandi, abaikan email ini — kata sandi Anda tetap aman.',
    }),
    text,
  };
}

/* ------------------------------------------------------------------ *
 * Delivery
 * ------------------------------------------------------------------ */

async function sendViaResend(input: { to: string; subject: string; text: string; html?: string }): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  if (!apiKey) {
    return { configured: true, delivered: false, reason: 'RESEND_API_KEY tidak dikonfigurasi.' };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [input.to],
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return {
      configured: true,
      delivered: false,
      reason: `Provider email menolak pengiriman (HTTP ${res.status}).${detail ? ` ${detail.slice(0, 300)}` : ''}`,
    };
  }
  return { configured: true, delivered: true };
}

async function sendViaSmtp(input: { to: string; subject: string; text: string; html?: string }): Promise<EmailResult> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return { configured: true, delivered: false, reason: 'SMTP_HOST tidak dikonfigurasi.' };
  }
  const port = Number.parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';

  // Dynamic import keeps nodemailer out of the bundle unless SMTP is used.
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    ...(user || pass ? { auth: { user: user ?? '', pass: pass ?? '' } } : {}),
  });
  await transporter.sendMail({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
  });
  return { configured: true, delivered: true };
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailResult> {
  const provider = getProvider();
  if (provider === 'none') {
    return { configured: false, delivered: false, reason: 'Layanan email belum dikonfigurasi.' };
  }
  try {
    if (provider === 'resend') return await sendViaResend(input);
    return await sendViaSmtp(input);
  } catch (err) {
    console.error('[email] pengiriman gagal:', err);
    return {
      configured: true,
      delivered: false,
      reason: err instanceof Error ? err.message : 'Gagal mengirim email.',
    };
  }
}
