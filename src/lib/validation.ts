import { z } from "zod";
import { JAVA_VERSIONS, LIMITS, MC_VERSIONS, OPERATING_SYSTEMS, SOFTWARES } from "./pricing";

/** Strips characters commonly used for HTML/script injection in stored content. */
export function sanitizeText(input: string): string {
  return input
    .replace(/<\/?[^>]+>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim();
}

export const safeString = (max: number) =>
  z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(1).max(max));

export const optionalString = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform(sanitizeText)
    .pipe(z.string().max(max))
    .optional()
    .default("");

export const whatsappSchema = z
  .string()
  .transform((v) => v.replace(/[^\d]/g, ""))
  .pipe(z.string().min(9, "Nomor WhatsApp tidak valid").max(15, "Nomor WhatsApp tidak valid"))
  .transform((v) => (v.startsWith("0") ? `62${v.slice(1)}` : v));

export const configSchema = z.object({
  cpu: z.coerce.number().min(LIMITS.cpu.min).max(LIMITS.cpu.max),
  ram: z.coerce.number().min(LIMITS.ram.min).max(LIMITS.ram.max),
  ssd: z.coerce.number().min(LIMITS.ssd.min).max(LIMITS.ssd.max),
  os: z.enum(OPERATING_SYSTEMS as [string, ...string[]]),
  java: z.enum(JAVA_VERSIONS as [string, ...string[]]),
  mcVersion: z.enum(MC_VERSIONS as [string, ...string[]]),
  software: z.enum(SOFTWARES.map((s) => s.id) as [string, ...string[]]),
  billingCycle: z.enum(["monthly", "quarterly", "yearly"]),
});

export const orderSchema = z.object({
  name: safeString(80),
  whatsapp: whatsappSchema,
  email: z.string().email("Email tidak valid").max(120),
  serverName: safeString(60),
  notes: optionalString(600),
  coupon: z
    .string()
    .max(32)
    .transform((v) => v.trim().toUpperCase())
    .optional()
    .default(""),
  config: configSchema,
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid").max(120),
  password: z.string().min(8, "Kata sandi minimal 8 karakter").max(200),
});

export const ticketSchema = z.object({
  name: safeString(80),
  email: z.string().email("Email tidak valid").max(120),
  subject: safeString(120),
  message: safeString(2000),
});

export const contactSchema = ticketSchema;

export const couponCheckSchema = z.object({
  code: z.string().min(1).max(32),
  subtotal: z.coerce.number().min(0),
});

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Data tidak valid.";
}
