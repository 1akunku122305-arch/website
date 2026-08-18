import { ok, fail, readJson, writeAudit, runRequestGuard, generateId } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { ticketReplySchema } from '@/lib/validation/schemas';
import { hasPermission } from '@/lib/auth/rbac';
import type { Ticket, User } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(request, { authRequired: true });
  if (guard.error) return guard.error;
  const body = await readJson(request);
  const parsed = ticketReplySchema.safeParse(body);
  if (!parsed.success) return fail('validation_error', 'Pesan tidak valid.', 422, parsed.error.flatten());

  const store = await getDatastore();
  const ticket = await store.get<Ticket>('tickets', params.id);
  if (!ticket) return fail('not_found', 'Tiket tidak ditemukan.', 404);
  const isOwner = ticket.customerId === guard.session.sub;
  const isStaff = hasPermission(guard.session.role, 'tickets:write');
  if (!isOwner && !isStaff) return fail('forbidden', 'Akses ditolak.', 403);

  const user = await store.get<User>('users', guard.session.sub);
  const now = new Date().toISOString();
  await store.create('ticketMessages', {
    id: generateId('msg'),
    ticketId: params.id,
    authorId: guard.session.sub,
    authorName: user?.name ?? 'Pengguna',
    body: parsed.data.body,
    createdAt: now,
  } as never);
  await store.update('tickets', params.id, { updatedAt: now, status: isStaff ? 'pending' : ticket.status } as never);
  await writeAudit({ actorId: guard.session.sub, actorRole: guard.session.role, action: 'update', resource: 'tickets', resourceId: params.id, ip: guard.ip });

  return ok({ message: 'Balasan terkirim.' }, 201);
}
