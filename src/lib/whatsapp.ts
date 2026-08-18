import type { Order } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

/**
 * WhatsApp integration. The number is configured via WHATSAPP_NUMBER env.
 * If it is not configured, integrations honestly report "not configured".
 */

export function getWhatsappNumber(): string | null {
  const n = process.env.WHATSAPP_NUMBER?.trim();
  return n && n.length > 0 ? n : null;
}

export function isWhatsappConfigured(): boolean {
  return getWhatsappNumber() !== null;
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export interface OrderMessageInput {
  order: Order;
  tierLabel: string;
  packageLabel?: string;
}

/**
 * Build the order summary message sent over WhatsApp.
 * Also includes the purchase warning statement (persetujuan).
 */
export function buildOrderWhatsappMessage(input: OrderMessageInput): string {
  const o = input.order;
  const lines: string[] = [];
  lines.push(`Halo WangStore! Saya ingin memesan layanan hosting.`);
  lines.push('');
  lines.push(`Order ID: ${o.id}`);
  lines.push(`Nama: ${o.name}`);
  lines.push(`WhatsApp: ${o.whatsapp}`);
  lines.push(`Email: ${o.email}`);
  lines.push(`Nama Server: ${o.serverName}`);
  lines.push('');
  lines.push(`Layanan: ${input.tierLabel}${input.packageLabel ? ` (${input.packageLabel})` : ''}`);
  lines.push(`CPU: ${o.cpu} vCore`);
  lines.push(`RAM: ${o.ram} GB`);
  lines.push(`Penyimpanan: ${o.storage} GB`);
  lines.push('');
  if (o.couponCode) {
    lines.push(`Kupon: ${o.couponCode}`);
  }
  lines.push(`Subtotal: ${formatRupiah(o.subtotal)}`);
  if (o.discount > 0) {
    lines.push(`Diskon: ${formatRupiah(o.discount)}`);
  }
  lines.push(`Total: ${formatRupiah(o.total)}/bulan`);
  lines.push('');
  lines.push(
    'Saya menyatakan bahwa konfigurasi sudah benar dan memahami bahwa pembelian bersifat final sesuai kebijakan WangStore.',
  );
  return lines.join('\n');
}

/** All WhatsApp statuses/messages are built here; no hardcoded copy elsewhere. */
export const WHATSAPP_NUMBER = getWhatsappNumber;
