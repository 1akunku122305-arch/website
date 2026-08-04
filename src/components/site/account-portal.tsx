"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Bell, Inbox, Loader2, Package, Save, Search, Settings2 } from "lucide-react";
import type { Order, Ticket } from "@/lib/types";
import { formatIDR, normalizeConfig, PANELS, SOFTWARES, type BuildConfig } from "@/lib/pricing";
import { Badge, Button, ButtonLink, Card, Stat } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { useMounted, useStoredJson } from "@/lib/client-hooks";

const EMAIL_KEY = "wangstore:account:email";
const CONFIG_KEY = "wangstore:builder:v1";

export function AccountPortal({ whatsapp, discord }: { whatsapp: string; discord: string }) {
  const mounted = useMounted();

  // Remembered email and saved build are read after hydration, so the first
  // client render matches the server output exactly.
  const rememberedEmail = mounted ? (window.localStorage.getItem(EMAIL_KEY) ?? "") : "";
  const storedConfig = useStoredJson<Partial<BuildConfig>>(CONFIG_KEY);
  const savedConfig: BuildConfig | null = storedConfig ? normalizeConfig(storedConfig) : null;

  const [typedEmail, setEmail] = useState<string | null>(null);
  const email = typedEmail ?? rememberedEmail;

  const [submitted, setSubmitted] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async function load(target: string) {
    setLoading(true);
    setError(null);
    try {
      const [o, t] = await Promise.all([
        fetch(`/api/orders?email=${encodeURIComponent(target)}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/tickets?email=${encodeURIComponent(target)}`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (o.ok) setOrders(o.data.orders as Order[]);
      if (t.ok) setTickets(t.data.tickets as Ticket[]);
      if (!o.ok) setError(o.error as string);
      setSubmitted(target);
      localStorage.setItem(EMAIL_KEY, target);
    } catch {
      setError("Gagal memuat data. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }, []);

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const activeCount = orders.filter((o) => o.status === "ACTIVE" || o.status === "PAID").length;

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black">Portal Pelanggan</h1>
        <p className="mt-1 text-sm text-[#a99fc8]">
          Masukkan email yang Anda gunakan saat memesan untuk melihat riwayat pesanan, tiket dukungan, dan notifikasi.
        </p>
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) void load(email.trim().toLowerCase());
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6690]" />
            <input
              type="email"
              required
              className="input pl-11"
              placeholder="email@anda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email pelanggan"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Inbox className="h-4 w-4" />} Muat Data
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm font-bold text-[#fb7185]">{error}</p> : null}
      </Card>

      {submitted ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Total pesanan" value={String(orders.length)} sub={`${activeCount} aktif`} />
            <Stat label="Total nilai" value={formatIDR(totalSpent)} />
            <Stat label="Tiket dukungan" value={String(tickets.length)} />
          </div>

          <Card>
            <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-black">
              <Package className="h-5 w-5 text-[#c3ff3e]" /> Riwayat Pesanan
            </h2>
            {orders.length === 0 ? (
              <p className="mt-4 text-sm text-[#a99fc8]">
                Belum ada pesanan untuk email ini.{" "}
                <Link href="/builder" className="font-bold text-[#c3ff3e] underline">
                  Racik server pertama Anda
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {orders.map((o) => (
                  <li key={o.id} className="rounded-xl border-2 border-black bg-[#150f28] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-black">{o.serverName}</p>
                        <p className="text-xs text-[#8d83ad]">
                          {o.id} • {formatDateTime(o.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#c3ff3e]">{formatIDR(o.total)}</p>
                        <Badge tone={o.status === "ACTIVE" ? "lime" : o.status === "CANCELLED" ? "danger" : "muted"}>
                          {o.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-[#a99fc8]">
                      {String(o.config.cpu)} vCore • {String(o.config.ram)} GB RAM • {String(o.config.ssd)} GB SSD •{" "}
                      {SOFTWARES.find((s) => s.id === o.config.software)?.label} •{" "}
                      {PANELS.find((p) => p.id === o.config.panel)?.label}
                    </p>
                    <Link href={`/order/${o.id}`} className="mt-3 inline-block text-xs font-black uppercase text-[#c084fc]">
                      Lihat detail →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-black">
              <Inbox className="h-5 w-5 text-[#c3ff3e]" /> Tiket Dukungan
            </h2>
            {tickets.length === 0 ? (
              <p className="mt-4 text-sm text-[#a99fc8]">
                Belum ada tiket.{" "}
                <Link href="/contact" className="font-bold text-[#c3ff3e] underline">
                  Buat tiket baru
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {tickets.map((t) => (
                  <li key={t.id} className="rounded-xl border-2 border-black bg-[#150f28] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-black">{t.subject}</p>
                      <Badge tone={t.status === "OPEN" ? "brand" : t.status === "CLOSED" ? "muted" : "lime"}>
                        {t.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#8d83ad]">
                      {t.id} • {formatDateTime(t.createdAt)}
                    </p>
                    <p className="mt-3 text-sm text-[#cdc3ea]">{t.message}</p>
                    {t.replies.length > 0 ? (
                      <ul className="mt-3 space-y-2 border-l-2 border-[#3a2a63] pl-3">
                        {t.replies.map((r, i) => (
                          <li key={i}>
                            <p className="text-[11px] font-bold uppercase text-[#8d83ad]">
                              {r.author} • {formatDateTime(r.at)}
                            </p>
                            <p className="text-sm text-[#cdc3ea]">{r.body}</p>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}

      <Card>
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-black">
          <Save className="h-5 w-5 text-[#c3ff3e]" /> Konfigurasi Tersimpan
        </h2>
        {savedConfig ? (
          <>
            <p className="mt-3 text-sm text-[#cdc3ea]">
              {savedConfig.cpu} vCore • {savedConfig.ram} GB RAM • {savedConfig.ssd} GB SSD •{" "}
              {savedConfig.nvme ? `${savedConfig.nvme} GB NVMe • ` : ""}
              {SOFTWARES.find((s) => s.id === savedConfig.software)?.label} • region {savedConfig.region.toUpperCase()}
            </p>
            <ButtonLink href="/builder" className="mt-4" size="sm">
              <Settings2 className="h-4 w-4" /> Lanjutkan di Builder
            </ButtonLink>
          </>
        ) : (
          <p className="mt-3 text-sm text-[#a99fc8]">
            Belum ada konfigurasi tersimpan. Simpan racikan Anda dari Server Builder untuk melanjutkannya kapan saja.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-black">
          <Bell className="h-5 w-5 text-[#c3ff3e]" /> Kontak Cepat
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border-[3px] border-black bg-gradient-to-br from-[#d946ef] to-[#7c3aed] px-5 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0_0_#000]"
          >
            WhatsApp Support
          </a>
          <a
            href={discord}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border-[3px] border-black bg-[#1b1233] px-5 py-3 text-sm font-black uppercase shadow-[4px_4px_0_0_#000]"
          >
            Gabung Discord
          </a>
          <ButtonLink href="/knowledge-base" variant="secondary">
            Knowledge Base
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
