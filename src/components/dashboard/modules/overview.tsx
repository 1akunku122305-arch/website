"use client";

import { ArrowUpRight } from "lucide-react";
import type { Database } from "@/lib/types";
import { formatIDR } from "@/lib/pricing";
import { Badge, Card, Meter, Stat } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export function OverviewModule({
  db,
  onNavigate,
  analyticsOnly = false,
}: {
  db: Database;
  onNavigate: (id: string) => void;
  analyticsOnly?: boolean;
}) {
  const revenue = db.orders.reduce((sum, o) => sum + o.total, 0);
  const customers = new Set(db.orders.map((o) => o.customer.email)).size;
  const openTickets = db.tickets.filter((t) => t.status === "OPEN").length;
  const avgOrder = db.orders.length ? Math.round(revenue / db.orders.length) : 0;

  const byStatus = db.orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const byRegion = db.orders.reduce<Record<string, number>>((acc, o) => {
    const key = String(o.config.region ?? "-");
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const operational = db.nodes.filter((n) => n.status === "OPERATIONAL").length;

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black">
          {analyticsOnly ? "Analitik" : "Ringkasan"}
        </h1>
        <p className="mt-1 text-sm text-[#a99fc8]">
          Data dihitung langsung dari datastore produksi — tidak ada angka contoh.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total pesanan" value={String(db.orders.length)} sub={`${byStatus.NEW ?? 0} menunggu tindak lanjut`} />
        <Stat label="Nilai pesanan" value={formatIDR(revenue)} sub={`rata-rata ${formatIDR(avgOrder)}`} />
        <Stat label="Pelanggan unik" value={String(customers)} sub="berdasarkan email" />
        <Stat label="Tiket terbuka" value={String(openTickets)} sub={`${db.tickets.length} total tiket`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-black">Status pesanan</h2>
          {db.orders.length === 0 ? (
            <p className="mt-4 text-sm text-[#a99fc8]">Belum ada pesanan masuk.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {Object.entries(byStatus).map(([status, count]) => (
                <Meter
                  key={status}
                  label={`${status} (${count})`}
                  value={(count / db.orders.length) * 100}
                  tone={status === "CANCELLED" ? "danger" : "brand"}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-black">Sebaran region</h2>
          {Object.keys(byRegion).length === 0 ? (
            <p className="mt-4 text-sm text-[#a99fc8]">Belum ada data region.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {Object.entries(byRegion).map(([region, count]) => (
                <Meter
                  key={region}
                  label={`${db.regions.find((r) => r.id === region)?.name ?? region} (${count})`}
                  value={(count / db.orders.length) * 100}
                  tone="lime"
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-black">Kesehatan infrastruktur</h2>
          <Badge tone={operational === db.nodes.length ? "lime" : "cyan"}>
            {operational}/{db.nodes.length} operasional
          </Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.nodes.map((n) => (
            <div key={n.id} className="rounded-xl border-2 border-black bg-[#150f28] p-3">
              <p className="text-sm font-black">{n.name}</p>
              <p className="text-xs text-[#8d83ad]">
                {n.region} • {n.status}
              </p>
              <p className="mt-1 text-sm font-black text-[#c3ff3e]">{n.uptime30d}%</p>
            </div>
          ))}
        </div>
      </Card>

      {!analyticsOnly ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-black">Pesanan terbaru</h2>
              <button
                type="button"
                onClick={() => onNavigate("orders")}
                className="inline-flex items-center gap-1 text-xs font-black uppercase text-[#c3ff3e]"
              >
                Buka <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            {db.orders.length === 0 ? (
              <p className="mt-4 text-sm text-[#a99fc8]">Belum ada pesanan.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {db.orders.slice(0, 6).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 rounded-xl border-2 border-black bg-[#150f28] p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{o.serverName}</p>
                      <p className="truncate text-xs text-[#8d83ad]">
                        {o.customer.name} • {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-[#c3ff3e]">{formatIDR(o.total)}</p>
                      <Badge tone="muted">{o.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-black">Aktivitas terakhir</h2>
              <button
                type="button"
                onClick={() => onNavigate("audit")}
                className="inline-flex items-center gap-1 text-xs font-black uppercase text-[#c3ff3e]"
              >
                Audit log <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            {db.audit.length === 0 ? (
              <p className="mt-4 text-sm text-[#a99fc8]">Belum ada aktivitas tercatat.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {db.audit.slice(0, 8).map((a) => (
                  <li key={a.id} className="rounded-xl border-2 border-black bg-[#150f28] p-3">
                    <p className="text-sm font-bold">{a.action}</p>
                    <p className="text-xs text-[#8d83ad]">
                      {a.actor} → {a.target} • {formatDateTime(a.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
