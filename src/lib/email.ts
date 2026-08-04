import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.SMTP_USER) {
    console.log("⚠️ SMTP not configured. Email would be sent to:", to);
    console.log("Subject:", subject);
    return { success: true, message: "Email logged (SMTP not configured)" };
  }

  try {
    await transporter.sendMail({
      from: `"WangStore" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}

// Email Templates
export const emailTemplates = {
  verifyEmail: (name: string, link: string) => ({
    subject: "Verifikasi Email WangStore",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Halo ${name},</h2>
        <p>Terima kasih telah mendaftar di WangStore.</p>
        <p>Silakan klik tombol di bawah untuk memverifikasi email Anda:</p>
        <a href="${link}" style="display:inline-block;background:#a855f7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
          Verifikasi Email
        </a>
        <p>Atau salin link ini: <br>${link}</p>
      </div>
    `,
  }),

  resetPassword: (name: string, link: string) => ({
    subject: "Reset Password WangStore",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Halo ${name},</h2>
        <p>Anda meminta reset password.</p>
        <a href="${link}" style="display:inline-block;background:#a855f7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
          Reset Password
        </a>
        <p>Link ini akan kadaluarsa dalam 1 jam.</p>
      </div>
    `,
  }),

  newOrderAdmin: (order: any) => ({
    subject: `Pesanan Baru #${order.id}`,
    html: `
      <div style="font-family: system-ui, sans-serif;">
        <h2>Pesanan Baru Masuk</h2>
        <p><strong>${order.customer.name}</strong> (${order.customer.email})</p>
        <p>Server: <strong>${order.serverName}</strong></p>
        <p>Total: <strong>Rp ${order.total.toLocaleString("id-ID")}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">Lihat di Dashboard</a>
      </div>
    `,
  }),

  orderApprovedCustomer: (order: any, invoiceLink?: string) => ({
    subject: `Pesanan #${order.id} Disetujui`,
    html: `
      <div style="font-family: system-ui, sans-serif;">
        <h2>Pesanan Anda Disetujui</h2>
        <p>Terima kasih! Pembayaran Anda telah dikonfirmasi.</p>
        <p>Server <strong>${order.serverName}</strong> sedang diproses.</p>
        ${invoiceLink ? `<p><a href="${invoiceLink}">Download Invoice</a></p>` : ""}
      </div>
    `,
  }),
};
