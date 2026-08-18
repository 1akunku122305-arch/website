import { ok, fail, readJson, writeAudit, runRequestGuard, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { ticketSchema } from '@/lib/validation/schemas';
import { getSession } from '@/lib/auth/session';
import type { Ticket, TicketMessage, User } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();
  const tickets = (await store.list<Ticket>('tickets'))
    .filter((t) => t.customerId === guard.session.sub)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok({ tickets });
}

export async function POST(request: Request) {
  const guard = await runRequestGuard(request, { rateLimitScope: 'default', authRequired: true });
  if (guard.error) return guard.error;
  const body = await readJson(request);
  const parsed = ticketSchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Data tiket tidak valid.', 422, parsed.error.flatten());
  const data = parsed.data;

  const store = await getDatastore();
  const now = new Date().toISOString();
  const user = await store.get<User>('users', guard.session.sub);
  const ticket: Ticket = {
    id: generateId('tk'),
    customerId: guard.session.sub,
    subject: data.subject,
    body: data.body,
    status: 'open',
    priority: data.priority,
    createdAt: now,
    updatedAt: now,
  };
  await store.transaction(async (tx) => {
    await tx.create('tickets', ticket as never);
    await tx.create('ticketMessages', {
      id: generateId('msg'),
      ticketId: ticket.id,
      authorId: guard.session.sub,
      authorName: user?.name ?? 'Pelanggan',
      body: data.body,
      createdAt: now,
    } as never);
  });
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'create', resource: 'tickets', resourceId: ticket.id, ip: guard.ip });
  return ok({ ticket }, 201);
}
