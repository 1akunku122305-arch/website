import { ok, fail, readJson, writeAudit, runRequestGuard, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { contactSchema } from '@/lib/validation/schemas';
import { getSession } from '@/lib/auth/session';
import type { Ticket } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'contact' });
  if (guard.error) return guard.error;

  const body = await readJson(request);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data kontak tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data;

  const store = await getDatastore();
  const session = await getSession();
  const now = new Date().toISOString();

  const ticket: Ticket = {
    id: generateId('tk'),
    customerId: session?.sub ?? null,
    subject: data.subject,
    body: data.message,
    status: 'open',
    priority: 'normal',
    createdAt: now,
    updatedAt: now,
  };

  await store.transaction(async (tx) => {
    await tx.create('tickets', ticket as never);
    await tx.create('ticketMessages', {
      id: generateId('msg'),
      ticketId: ticket.id,
      authorId: session?.sub ?? null,
      authorName: data.name,
      body: data.message,
      createdAt: now,
    } as never);
  });

  await writeAudit({ actorId: session?.sub ?? null, actorRole: session?.role ?? null, action: 'create', resource: 'contact', resourceId: ticket.id, ip: guard.ip });
  return ok({ message: 'Pesan berhasil dikirim. Tim WangStore akan segera menghubungi Anda.', ticketId: ticket.id }, 201);
}
