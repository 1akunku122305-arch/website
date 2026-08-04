"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Loader2, MessageCircle, RotateCcw, Save, Tag } from "lucide-react";
import {
  CYCLES,
  DEFAULT_CONFIG,
  HARDWARE_TIERS,
  JAVA_VERSIONS,
  LIMITS,
  MC_VERSIONS,
  OPERATING_SYSTEMS,
  PANELS,
  SOFTWARES,
  computeQuote,
  formatIDR,
  normalizeConfig,
  validateHardwareSoftware,
  type BuildConfig,
  type HardwareTier,
} from "@/lib/pricing";
import type { Coupon, PriceFormula, Region } from "@/lib/types";
import { Badge, Button, Card, Field, Meter, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useStoredJson } from "@/lib/client-hooks";

const STORAGE_KEY = "wangstore:builder:v1";

interface Props {
  formula: PriceFormula;
  regions: Region[];
  whatsapp: string;
}

interface OrderForm {
  name: string;
  whatsapp: string;
  email: string;
  serverName: string;
  notes: string;
  coupon: string;
}

const EMPTY_FORM: OrderForm = { name: "", whatsapp: "", email: "", serverName: "", notes: "", coupon: "" };

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint?: string;
}) {
  const id = `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="label">
          {label}
        </label>
        <span className="font-[family-name:var(--font-display)] text-lg font-black text-[#c3ff3e]">
          {value} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full border-2 border-black bg-[#0f0b1d] accent-[#a855f7] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-[#c3ff3e]"
      />
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#6f6690]">
        <span>
          {min} {unit}
        </span>
        {hint ? <span className="text-[#8d83ad]">{hint}</span> : null}
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  price,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  price: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border-[3px] border-black p-4 text-left shadow-[3px_3px_0_0_#000] transition-all hover:-translate-y-0.5",
        checked ? "bg-[#2a1a4f]" : "bg-[#150f28]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-black",
          checked ? "bg-[#c3ff3e]" : "bg-[#0f0b1d]",
        )}
      >
        {checked ? <Check className="h-4 w-4 text-black" strokeWidth={4} /> : null}
      </span>
      <span className="flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-black">{label}</span>
          <span className="text-xs font-black text-[#c3ff3e]">{price}</span>
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-[#8d83ad]">{desc}</span>
      </span>
    </button>
  );
}

export function ServerBuilder({ formula, regions, whatsapp, tier = "pvnode" }: Props & { tier?: HardwareTier }) {
  // A previously saved build is read after hydration (null on the server), so
  // the first client render matches the server exactly. Any user edit takes
  // precedence from then on.
  const stored = useStoredJson<Partial<BuildConfig>>(STORAGE_KEY);
  const [edited, setCfg] = useState<BuildConfig | null>(null);
  const [selectedTier, setSelectedTier] = useState<HardwareTier>(tier);
  
  const cfg = edited ?? (stored ? normalizeConfig(stored) : DEFAULT_CONFIG);
  
  const hardware = HARDWARE_TIERS[selectedTier];
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({});
  const [saved, setSaved] = useState(false);

  const set = useCallback(
    <K extends keyof BuildConfig>(key: K, value: BuildConfig[K]) => {
      setCfg(normalizeConfig({ ...cfg, [key]: value }));
    },
    [cfg],
  );

  const quote = useMemo(() => computeQuote(cfg, formula, regions, coupon), [cfg, formula, regions, coupon]);
  const m = quote.metrics;
  const software = SOFTWARES.find((s) => s.id === cfg.software)!;
  const isProxy = software.kind === "proxy";
  
  const validation = validateHardwareSoftware(cfg);

  const summary = useMemo(() => {
    const region = regions.find((r) => r.id === cfg.region);
    const lines = [
      "*PESANAN WANGSTORE*",
      "",
      `Nama        : ${form.name || "-"}`,
      `Email       : ${form.email || "-"}`,
      `WhatsApp    : ${form.whatsapp || "-"}`,
      `Nama Server : ${form.serverName || "-"}`,
      "",
      "*SPESIFIKASI*",
      `CPU         : ${cfg.cpu} vCore`,
      `RAM         : ${cfg.ram} GB DDR5`,
      `SSD         : ${cfg.ssd} GB`,
      cfg.nvme ? `NVMe        : ${cfg.nvme} GB` : "",
      cfg.hdd ? `HDD         : ${cfg.hdd} GB` : "",
      `Bandwidth   : ${cfg.bandwidth} TB`,
      `Region      : ${region?.flag ?? ""} ${region?.name ?? cfg.region}`,
      `OS          : ${cfg.os}`,
      `Software    : ${software.label}`,
      !isProxy ? `Minecraft   : ${cfg.mcVersion}` : "",
      `Java        : ${cfg.java}`,
      `Panel       : ${PANELS.find((p) => p.id === cfg.panel)?.label}`,
      "",
      "*ADD-ON*",
      `Dedicated IP: ${cfg.dedicatedIp ? "Ya" : "Tidak"}`,
      `Port ekstra : ${cfg.extraPorts}`,
      `Backup      : ${cfg.backup ? "Ya" : "Tidak"}`,
      `Priority    : ${cfg.prioritySupport ? "Ya" : "Tidak"}`,
      `DDoS Adv.   : ${cfg.ddosAdvanced ? "Ya" : "Tidak"}`,
      "",
      "*ESTIMASI PERFORMA*",
      `TPS         : ~${m.tps}`,
      `Pemain      : ~${m.players}`,
      `Plugin      : ~${m.plugins}`,
      "",
      "*BIAYA*",
      `Siklus      : ${CYCLES[cfg.billingCycle].label}`,
      `Per bulan   : ${formatIDR(quote.monthly)}`,
      `Subtotal    : ${formatIDR(quote.subtotal)}`,
      quote.couponApplied ? `Kupon ${quote.couponApplied} : -${formatIDR(quote.couponDiscount)}` : "",
      `TOTAL       : ${formatIDR(quote.total)}`,
      "",
      form.notes ? `Catatan: ${form.notes}` : "",
    ];
    return lines.filter(Boolean).join("\n");
  }, [cfg, form, quote, regions, software, isProxy, m]);

  async function applyCoupon() {
    const code = form.coupon.trim().toUpperCase();
    if (!code) {
      setCoupon(null);
      setCouponMsg(null);
      return;
    }
    setChecking(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: quote.subtotal }),
      });
      const json = await res.json();
      if (json.ok) {
        setCoupon(json.data.coupon as Coupon);
        setCouponMsg(`Kupon ${code} diterapkan — ${json.data.coupon.description}`);
      } else {
        setCoupon(null);
        setCouponMsg(json.error as string);
      }
    } catch {
      setCoupon(null);
      setCouponMsg("Gagal memeriksa kupon. Periksa koneksi Anda.");
    } finally {
      setChecking(false);
    }
  }

  function validate(): boolean {
    const next: Partial<Record<keyof OrderForm, string>> = {};
    if (form.name.trim().length < 2) next.name = "Nama minimal 2 karakter.";
    if (!/^[\d+\-\s()]{9,20}$/.test(form.whatsapp.trim())) next.whatsapp = "Nomor WhatsApp tidak valid.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Email tidak valid.";
    if (form.serverName.trim().length < 2) next.serverName = "Nama server minimal 2 karakter.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    if (!validate()) {
      document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, config: cfg }),
      });
      const json = await res.json();
      if (!json.ok) {
        setCouponMsg(json.error as string);
        return;
      }
      window.open(json.data.whatsappUrl as string, "_blank", "noopener,noreferrer");
      window.location.href = `/order/${json.data.orderId}`;
    } catch {
      // Ordering must never dead-end: fall back to a direct WhatsApp handoff.
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`, "_blank", "noopener,noreferrer");
    } finally {
      setSubmitting(false);
    }
  }

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  const belowMin = quote.total <= 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        {/* Hardware Tier Selector */}
        <Card>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-black mb-4">Pilih Hardware Tier</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(HARDWARE_TIERS).map(([key, h]) => (
              <button
                key={key}
                onClick={() => setSelectedTier(key as HardwareTier)}
                className={cn(
                  "rounded-2xl border-[3px] border-black p-4 text-left transition-all hover:-translate-y-0.5",
                  selectedTier === key 
                    ? "bg-gradient-to-br from-[#d946ef] to-[#7c3aed] text-white shadow-[3px_3px_0_0_#000]" 
                    : "bg-[#150f28] text-[#cdc3ea]"
                )}
              >
                <div className="font-black text-sm">{h.name}</div>
                <div className="text-xs mt-1 opacity-75">{h.cpuModel}</div>
                <div className="text-[#c3ff3e] text-xs mt-2 font-bold">Mulai {formatIDR(h.basePrice)}/bln</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Resources */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-black">1. Sumber Daya</h2>
            <Badge tone="lime">Grade {m.grade}</Badge>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Slider label="CPU" value={cfg.cpu} onChange={(v) => set("cpu", v)} {...LIMITS.cpu} unit="vCore" hint="Ryzen 9 / EPYC" />
            <Slider label="RAM" value={cfg.ram} onChange={(v) => set("ram", v)} {...LIMITS.ram} unit="GB" hint="DDR5 ECC" />
            <Slider label="SSD" value={cfg.ssd} onChange={(v) => set("ssd", v)} {...LIMITS.ssd} unit="GB" hint="SATA enterprise" />
            <Slider label="NVMe Gen4" value={cfg.nvme} onChange={(v) => set("nvme", v)} {...LIMITS.nvme} unit="GB" hint="Tercepat" />
            <Slider label="HDD" value={cfg.hdd} onChange={(v) => set("hdd", v)} {...LIMITS.hdd} unit="GB" hint="Arsip & backup" />
            <Slider label="Bandwidth" value={cfg.bandwidth} onChange={(v) => set("bandwidth", v)} {...LIMITS.bandwidth} unit="TB" hint="Port 10 Gbps" />
          </div>
        </Card>

        {/* Software */}
        <Card>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-black">2. Software & Sistem</h2>

          <p className="label mt-6">Server Software</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SOFTWARES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => set("software", s.id)}
                aria-pressed={cfg.software === s.id}
                title={s.note}
                className={cn(
                  "rounded-xl border-[3px] border-black px-3 py-3 text-sm font-black shadow-[3px_3px_0_0_#000] transition-all hover:-translate-y-0.5",
                  cfg.software === s.id ? "bg-gradient-to-br from-[#d946ef] to-[#7c3aed] text-white" : "bg-[#150f28] text-[#cdc3ea]",
                )}
              >
                {s.label}
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-widest opacity-70">
                  {s.kind === "proxy" ? "Proxy" : "Server"}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#8d83ad]">{software.note}</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Sistem Operasi" htmlFor="os">
              <select id="os" className="input" value={cfg.os} onChange={(e) => set("os", e.target.value)}>
                {OPERATING_SYSTEMS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Versi Java" htmlFor="java">
              <select id="java" className="input" value={cfg.java} onChange={(e) => set("java", e.target.value)}>
                {JAVA_VERSIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Versi Minecraft" htmlFor="mc" hint={isProxy ? "Proxy mendukung multi-versi via backend." : undefined}>
              <select id="mc" className="input" value={cfg.mcVersion} onChange={(e) => set("mcVersion", e.target.value)}>
                {MC_VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Panel" htmlFor="panel">
              <select
                id="panel"
                className="input"
                value={cfg.panel}
                onChange={(e) => set("panel", e.target.value as BuildConfig["panel"])}
              >
                {PANELS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {/* Region */}
        <Card>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-black">3. Region</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {regions
              .filter((r) => r.enabled)
              .map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => set("region", r.id)}
                  aria-pressed={cfg.region === r.id}
                  className={cn(
                    "rounded-2xl border-[3px] border-black p-4 text-center shadow-[3px_3px_0_0_#000] transition-all hover:-translate-y-0.5",
                    cfg.region === r.id ? "bg-gradient-to-br from-[#d946ef] to-[#7c3aed]" : "bg-[#150f28]",
                  )}
                >
                  <span className="text-2xl" aria-hidden>
                    {r.flag}
                  </span>
                  <span className="mt-1 block text-sm font-black">{r.name}</span>
                  <span className="block text-[11px] text-[#cdc3ea]">{r.latencyMs} ms</span>
                </button>
              ))}
          </div>
        </Card>

        {/* Add-ons */}
        <Card>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-black">4. Add-on</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Toggle
              label="Dedicated IPv4"
              desc="Alamat IP eksklusif tanpa berbagi port."
              price={formatIDR(formula.dedicatedIp)}
              checked={cfg.dedicatedIp}
              onChange={(v) => set("dedicatedIp", v)}
            />
            <Toggle
              label="Automatic Backup"
              desc="Snapshot harian terenkripsi, retensi 7 hari off-site."
              price={formatIDR(formula.backup)}
              checked={cfg.backup}
              onChange={(v) => set("backup", v)}
            />
            <Toggle
              label="Priority Support"
              desc="Antrean tiket prioritas dengan SLA respons 15 menit."
              price={formatIDR(formula.prioritySupport)}
              checked={cfg.prioritySupport}
              onChange={(v) => set("prioritySupport", v)}
            />
            <Toggle
              label="Advanced DDoS"
              desc="Filter L7 dan aturan khusus per game di edge."
              price={formatIDR(formula.ddosAdvanced)}
              checked={cfg.ddosAdvanced}
              onChange={(v) => set("ddosAdvanced", v)}
            />
          </div>
          <div className="mt-5">
            <Slider
              label="Port Tambahan"
              value={cfg.extraPorts}
              onChange={(v) => set("extraPorts", v)}
              {...LIMITS.ports}
              unit="port"
              hint={`${formatIDR(formula.perExtraPort)}/port`}
            />
          </div>
        </Card>

        {/* Order form */}
        <Card id="order-form">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-black">5. Data Pemesan</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Nama Lengkap" htmlFor="f-name" error={errors.name}>
              <input
                id="f-name"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Budi Santoso"
                autoComplete="name"
              />
            </Field>
            <Field label="Nomor WhatsApp" htmlFor="f-wa" error={errors.whatsapp} hint="Contoh: 081200000000">
              <input
                id="f-wa"
                className="input"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="081200000000"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
            <Field label="Email" htmlFor="f-email" error={errors.email}>
              <input
                id="f-email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="budi@email.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Nama Server" htmlFor="f-server" error={errors.serverName}>
              <input
                id="f-server"
                className="input"
                value={form.serverName}
                onChange={(e) => setForm({ ...form, serverName: e.target.value })}
                placeholder="SkyRealm SMP"
              />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Catatan" htmlFor="f-notes" hint="Plugin khusus, jadwal migrasi, atau permintaan lain.">
              <textarea
                id="f-notes"
                rows={3}
                className="input resize-y"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Butuh bantuan migrasi dunia 12 GB dari penyedia lama."
              />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Kode Kupon" htmlFor="f-coupon">
              <div className="flex gap-2">
                <input
                  id="f-coupon"
                  className="input uppercase"
                  value={form.coupon}
                  onChange={(e) => setForm({ ...form, coupon: e.target.value.toUpperCase() })}
                  placeholder="WANG10"
                />
                <Button type="button" variant="lime" onClick={applyCoupon} disabled={checking}>
                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                  Terapkan
                </Button>
              </div>
            </Field>
            {couponMsg ? (
              <p className={cn("mt-2 text-xs font-bold", coupon ? "text-[#c3ff3e]" : "text-[#fb7185]")}>{couponMsg}</p>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Sticky summary */}
      <div className="lg:sticky lg:top-24 lg:h-fit">
        <motion.div layout>
          <Card className="glow">
            <p className="label">Estimasi Biaya</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-4xl font-black text-[#c3ff3e]">
              {formatIDR(quote.monthly)}
              <span className="text-base text-[#a99fc8]">/bln</span>
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {(Object.keys(CYCLES) as (keyof typeof CYCLES)[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("billingCycle", key)}
                  aria-pressed={cfg.billingCycle === key}
                  className={cn(
                    "rounded-xl border-[3px] border-black px-2 py-2 text-[11px] font-black uppercase shadow-[2px_2px_0_0_#000] transition-all",
                    cfg.billingCycle === key ? "bg-[#c3ff3e] text-black" : "bg-[#150f28] text-[#cdc3ea]",
                  )}
                >
                  {CYCLES[key].label}
                  {CYCLES[key].discount ? (
                    <span className="block text-[9px]">-{CYCLES[key].discount * 100}%</span>
                  ) : null}
                </button>
              ))}
            </div>

            <ul className="mt-5 max-h-56 space-y-1.5 overflow-y-auto pr-1 text-xs">
              {quote.lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-3 text-[#a99fc8]">
                  <span>{l.label}</span>
                  <span className="font-bold text-[#cdc3ea]">{formatIDR(l.amount)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1.5 border-t-2 border-[#241645] pt-4 text-sm">
              <div className="flex justify-between text-[#a99fc8]">
                <span>Subtotal ({quote.cycleMonths} bln)</span>
                <span className="font-bold text-[#cdc3ea]">{formatIDR(quote.subtotal)}</span>
              </div>
              {quote.couponDiscount > 0 ? (
                <div className="flex justify-between text-[#c3ff3e]">
                  <span>Kupon {quote.couponApplied}</span>
                  <span className="font-bold">-{formatIDR(quote.couponDiscount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between pt-1 font-[family-name:var(--font-display)] text-xl font-black">
                <span>Total</span>
                <span className="text-[#c3ff3e]">{formatIDR(quote.total)}</span>
              </div>
            </div>

            {belowMin ? (
              <p className="mt-3 flex items-start gap-2 text-xs text-[#fbbf24]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Total menjadi nol karena kupon. Tim kami akan mengonfirmasi manual.
              </p>
            ) : null}

            <div className="mt-5 space-y-2">
              <Button type="button" className="w-full" size="lg" onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
                Pesan via WhatsApp
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={saveConfig}>
                  <Save className="h-4 w-4" />
                  {saved ? "Tersimpan" : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCfg(DEFAULT_CONFIG);
                    setCoupon(null);
                    setCouponMsg(null);
                    localStorage.removeItem(STORAGE_KEY);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <Card className="mt-6">
          <p className="label">Estimasi Performa</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="TPS" value={`~${m.tps}`} sub="target 20,0" />
            <Stat label="Pemain" value={`~${m.players}`} sub="konkuren" />
            <Stat label="Plugin" value={`~${m.plugins}`} sub="rekomendasi" />
            <Stat label="Grade" value={m.grade} sub="kelas build" />
          </div>
          <div className="mt-5 space-y-4">
            <Meter label="Perkiraan beban CPU" value={m.cpuLoad} tone={m.cpuLoad > 85 ? "danger" : "brand"} />
            <Meter label="Perkiraan pemakaian RAM" value={m.ramUsage} tone={m.ramUsage > 85 ? "danger" : "lime"} />
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-[#8d83ad]">
            Angka di atas adalah estimasi model kapasitas WangStore berdasarkan software, core, dan RAM yang dipilih.
            Hasil nyata dipengaruhi jumlah plugin, view-distance, dan perilaku pemain.
          </p>
        </Card>

        {/* Hardware Validation Warning */}
        {!validation.valid && validation.warning && (
          <Card className="border-[#f87171]">
            <div className="flex gap-3 text-[#f87171]">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <div className="font-black">Peringatan Konfigurasi</div>
                <div className="text-sm mt-1">{validation.warning}</div>
              </div>
            </div>
          </Card>
        )}

        <Card className="mt-6">
          <p className="label">Ringkasan Pesan WhatsApp</p>
          <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl border-2 border-black bg-[#0f0b1d] p-3 text-[11px] leading-relaxed text-[#a99fc8]">
            {summary}
          </pre>
        </Card>
      </div>
    </div>
  );
}
