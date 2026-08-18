import { ok, fail, runRequestGuard } from '@/lib/api';
import { getDatastore } from '@/lib/db';
import { hasPermission } from '@/lib/auth/rbac';
import type { Ticket, TicketMessage } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const guard = await runRequestGuard(_request, { authRequired: true });
  if (guard.error) return guard.error;
  const store = await getDatastore();
  const ticket = await store.get<Ticket>('tickets', params.id);
  if (!ticket) return fail('not_found', 'Tiket tidak ditemukan.', 404);

  const isOwner = ticket.customerId === guard.session.sub;
  const isStaff = hasPermission(guard.session.role, 'tickets:read');
  if (!isOwner && !isStaff) return fail('forbidden', 'Akses ditolak.', 403);

  const messages = (await store.list<TicketMessage>('ticketMessages'))
    .filter((m) => m.ticketId === params.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return ok({ ticket, messages });
}
