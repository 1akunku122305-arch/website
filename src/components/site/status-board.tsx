"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, RefreshCw, Wrench, XCircle } from "lucide-react";
import type { Incident, Node } from "@/lib/types";
import { Badge, Card, Meter } from "@/components/ui";
import { cn, formatDateTime } from "@/lib/utils";

interface StatusPayload {
  overall: string;
  operational: number;
  total: number;
  averageUptime: number;
  nodes: Node[];
  incidents: Incident[];
  checkedAt: string;
}

const NODE_TONE = {
  OPERATIONAL: { label: "Operasional", tone: "lime" as const, Icon: CheckCircle2 },
  DEGRADED: { label: "Terdegradasi", tone: "cyan" as const, Icon: CircleAlert },
  MAINTENANCE: { label: "Pemeliharaan", tone: "muted" as const, Icon: Wrench },
  DOWN: { label: "Gangguan", tone: "danger" as const, Icon: XCircle },
};

const OVERALL = {
  OPERATIONAL: { text: "Semua sistem beroperasi normal", bg: "bg-[#c3ff3e]" },
  MAINTENANCE: { text: "Pemeliharaan terjadwal sedang berlangsung", bg: "bg-[#22d3ee]" },
  DEGRADED: { text: "Sebagian layanan terdegradasi", bg: "bg-[#fbbf24]" },
  MAJOR_OUTAGE: { text: "Gangguan besar sedang ditangani", bg: "bg-[#f43f5e]" },
} as const;

export function StatusBoard({ initial }: { initial: StatusPayload }) {
  const [data, setData] = useState<StatusPayload>(initial);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) setData(json.data as StatusPayload);
    } catch {
      /* keep last known good state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(refresh, 60_000);
    return () => clearInterval(timer);
  }, [refresh]);

  const overall = OVERALL[(data.overall as keyof typeof OVERALL) ?? "OPERATIONAL"] ?? OVERALL.OPERATIONAL;
  const active = data.incidents.filter((i) => !i.resolvedAt);
  const past = data.incidents.filter((i) => i.resolvedAt);

  return (
    <div className="space-y-8">
      <div className={cn("brut flex flex-wrap items-center justify-between gap-4 p-6 text-black", overall.bg)}>
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest">Status Keseluruhan</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-black">{overall.text}</p>
          <p className="mt-1 text-xs font-bold">
            {data.operational}/{data.total} node operasional • uptime rata-rata {data.averageUptime}%
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border-[3px] border-black bg-black/10 px-4 py-2 text-xs font-black uppercase transition-colors hover:bg-black/20 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Perbarui
        </button>
      </div>

      <p className="text-xs text-[#8d83ad]">Terakhir diperiksa {formatDateTime(data.checkedAt)} • otomatis setiap 60 detik</p>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-black">Status node & region</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.nodes.map((n) => {
            const meta = NODE_TONE[n.status];
            return (
              <Card key={n.id} className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-base font-black">{n.name}</h3>
                    <p className="text-xs text-[#8d83ad]">{n.region}</p>
                  </div>
                  <Badge tone={meta.tone}>
                    <meta.Icon className="h-3 w-3" />
                    {meta.label}
                  </Badge>
                </div>
                <div className="mt-4">
                  <Meter label="Uptime 30 hari" value={n.uptime30d} tone={n.uptime30d >= 99.9 ? "lime" : "brand"} />
                </div>
                <p className="mt-3 text-[11px] text-[#8d83ad]">
                  {n.cpu} • {n.ram} • {n.network}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-black">
          Insiden aktif & pemeliharaan terjadwal
        </h2>
        {active.length === 0 ? (
          <Card className="mt-5">
            <p className="text-sm text-[#a99fc8]">Tidak ada insiden aktif. Semua layanan berjalan normal.</p>
          </Card>
        ) : (
          <div className="mt-5 space-y-4">
            {active.map((inc) => (
              <IncidentCard key={inc.id} incident={inc} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-black">Riwayat insiden</h2>
        <div className="mt-5 space-y-4">
          {past.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
        </div>
      </section>
    </div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const tone =
    incident.severity === "CRITICAL" || incident.severity === "MAJOR"
      ? "danger"
      : incident.severity === "MAINTENANCE"
        ? "cyan"
        : "muted";

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-base font-black">{incident.title}</h3>
        <div className="flex items-center gap-2">
          <Badge tone={tone}>{incident.severity}</Badge>
          <Badge tone={incident.resolvedAt ? "lime" : "brand"}>{incident.resolvedAt ? "Selesai" : "Berlangsung"}</Badge>
        </div>
      </div>
      <p className="mt-2 text-xs text-[#8d83ad]">
        Mulai {formatDateTime(incident.startedAt)}
        {incident.resolvedAt ? ` • Selesai ${formatDateTime(incident.resolvedAt)}` : ""} • Terdampak:{" "}
        {incident.affected.join(", ")}
      </p>
      <ol className="mt-4 space-y-3 border-l-2 border-[#3a2a63] pl-4">
        {incident.updates.map((u, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-[#a855f7]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#8d83ad]">{formatDateTime(u.at)}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#cdc3ea]">{u.body}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
