export const dynamic = 'force-dynamic';
import { getDatastore } from '@/lib/db';
import { Card, CardContent, EmptyState, Badge } from '@/components/ui/display';
import { formatDateTime } from '@/lib/utils';
import type { AuditLog } from '@/lib/types';

export default async function AdminAuditLogPage() {
  const store = await getDatastore();
  const logs = (await store.list<AuditLog>('auditLogs')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Riwayat aktivitas sensitif. Tidak menyimpan password atau secret.</p>
      {logs.length === 0 ? (
        <div className="mt-6"><EmptyState title="Belum ada aktivitas tercatat" /></div>
      ) : (
        <div className="mt-6 space-y-2">
          {logs.map((l) => (
            <Card key={l.id}>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{l.action}</span> · <span className="text-neutral-500">{l.resource}</span>
                      {l.resourceId ? ` · ${l.resourceId}` : ''}
                    </p>
                    {l.metadata && Object.keys(l.metadata).length > 0 && (
                      <p className="mt-0.5 text-xs text-neutral-400">{JSON.stringify(l.metadata)}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-neutral-400">
                    <p>{formatDateTime(l.createdAt)}</p>
                    <p>Aktor: {l.actorId ?? 'guest'} ({l.actorRole ?? '—'})</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
