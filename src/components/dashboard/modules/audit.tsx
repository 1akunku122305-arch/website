"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import type { AuditLog } from "@/lib/types";
import { Card } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export function AuditModule({ initial }: { initial: AuditLog[] }) {
  const [logs, setLogs] = useState<AuditLog[]>(initial);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) setLogs(json.data.items as AuditLog[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setInterval(refresh, 30_000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => `${l.actor} ${l.action} ${l.target}`.toLowerCase().includes(q));
  }, [logs, query]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-black">Audit Log</h1>
            <p className="mt-1 text-sm text-[#a99fc8]">
              Setiap login, perubahan konten, dan penghapusan data tercatat otomatis (500 entri terakhir).
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border-[3px] border-black bg-[#1b1233] px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_0_#000] disabled:opacity-50"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Perbarui
          </button>
        </div>
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6690]" />
          <input
            type="search"
            className="input pl-11"
            placeholder="Cari aktor, aksi, atau target…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari audit log"
          />
        </div>
      </Card>

      <Card className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#a99fc8]">Belum ada aktivitas tercatat.</p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b-[3px] border-black bg-[#1b1233] text-left">
                <th className="p-3 font-black">Waktu</th>
                <th className="p-3 font-black">Aktor</th>
                <th className="p-3 font-black">Aksi</th>
                <th className="p-3 font-black">Target</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b-2 border-[#241645]">
                  <td className="p-3 text-[#8d83ad]">{formatDateTime(l.at)}</td>
                  <td className="p-3 font-bold">{l.actor}</td>
                  <td className="p-3 text-[#c3ff3e]">{l.action}</td>
                  <td className="p-3 text-[#cdc3ea]">{l.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
