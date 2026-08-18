import type { Metadata } from 'next';
import { getDatastore } from '@/lib/db';
import type { Incident, MaintenanceWindow } from '@/lib/types';
import { Badge } from '@/components/ui/display';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Status Layanan' };

export const revalidate = 60;

const incidentBadge = (s: string) => {
  switch (s) {
    case 'resolved':
      return <Badge variant="success">Pulih</Badge>;
    case 'monitoring':
      return <Badge variant="info">Dipantau</Badge>;
    case 'identified':
      return <Badge variant="warning">Teridentifikasi</Badge>;
    default:
      return <Badge variant="error">Sedang Diselidiki</Badge>;
  }
};

export default async function StatusPage() {
  const store = await getDatastore();
  const [incidents, maintenance] = await Promise.all([
    store.list<Incident>('incidents').catch(() => []),
    store.list<MaintenanceWindow>('maintenanceWindows').catch(() => []),
  ]);

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const activeMaintenance = maintenance.filter((m) => ['scheduled', 'in_progress'].includes(m.status));
  const hasIssue = activeIncidents.length > 0 || activeMaintenance.length > 0;

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold">Status Layanan</h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        Status platform dan layanan WangStore. Halaman diperbarui secara berkala.
      </p>

      <div className="mt-8 card p-6">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${hasIssue ? 'bg-amber-500' : 'bg-green-500'}`} />
          <p className="font-semibold">{hasIssue ? 'Ada gangguan atau pemeliharaan' : 'Semua sistem normal'}</p>
        </div>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Status ini dikelola oleh tim WangStore dan hanya menampilkan informasi yang benar.
        </p>
      </div>

      {activeIncidents.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Insiden Aktif</h2>
          <div className="mt-4 space-y-3">
            {activeIncidents.map((i) => (
              <div key={i.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">{i.title}</h3>
                  {incidentBadge(i.status)}
                </div>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{i.message}</p>
                <p className="mt-1 text-xs text-neutral-400">Mulai: {formatDateTime(i.startedAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeMaintenance.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Maintenance Terjadwal</h2>
          <div className="mt-4 space-y-3">
            {activeMaintenance.map((m) => (
              <div key={m.id} className="card p-4">
                <h3 className="font-medium">{m.title}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{m.message}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {formatDateTime(m.scheduledStart)} – {formatDateTime(m.scheduledEnd)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Riwayat Insiden</h2>
        {incidents.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Belum ada insiden yang tercatat.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {[...incidents].reverse().map((i) => (
              <div key={i.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">{i.title}</h3>
                  {incidentBadge(i.status)}
                </div>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{i.message}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {formatDateTime(i.startedAt)}
                  {i.resolvedAt ? ` · Selesai ${formatDateTime(i.resolvedAt)}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-10 text-xs text-neutral-400">
        Catatan: WangStore adalah platform penjualan dan pengelolaan layanan. Status ini mencerminkan layanan platform WangStore. Data monitoring infrastruktur pelanggan tidak dipalsukan.
      </p>
    </div>
  );
}
