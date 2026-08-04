"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { PriceFormula } from "@/lib/types";
import { computeQuote, DEFAULT_CONFIG, formatIDR } from "@/lib/pricing";
import { Button, Card, Field, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";

const LABELS: Record<keyof Omit<PriceFormula, "currency">, string> = {
  base: "Biaya dasar platform",
  perCore: "Per vCore CPU",
  perGbRam: "Per GB RAM",
  perGbSsd: "Per GB SSD",
  perGbNvme: "Per GB NVMe",
  perGbHdd: "Per GB HDD",
  perTbBandwidth: "Per TB bandwidth",
  dedicatedIp: "Dedicated IPv4",
  perExtraPort: "Per port tambahan",
  backup: "Automatic backup",
  prioritySupport: "Priority support",
  ddosAdvanced: "Advanced DDoS",
  panelPterodactyl: "Panel Pterodactyl",
  panelReviactyl: "Panel Reviactyl",
};

export function PriceFormulaModule({ initial }: { initial: PriceFormula }) {
  const [formula, setFormula] = useState<PriceFormula>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const preview = computeQuote(DEFAULT_CONFIG, formula);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: { priceFormula: formula } }),
      });
      const json = await res.json();
      setMessage(json.ok ? { tone: "ok", text: "Formula harga tersimpan." } : { tone: "err", text: json.error as string });
    } catch {
      setMessage({ tone: "err", text: "Gagal menyimpan formula." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black">Formula Harga</h1>
        <p className="mt-1 text-sm text-[#a99fc8]">
          Semua harga di Server Builder dihitung dari komponen berikut, dikalikan pengali region dan dibulatkan ke
          kelipatan Rp500 dengan batas minimum Rp45.000 per bulan.
        </p>
        {message ? (
          <p
            className={cn(
              "mt-4 rounded-xl border-2 px-4 py-2 text-sm font-bold",
              message.tone === "ok" ? "border-[#c3ff3e] text-[#c3ff3e]" : "border-[#f43f5e] text-[#fb7185]",
            )}
          >
            {message.text}
          </p>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Konfigurasi minimum" value={formatIDR(preview.monthly)} sub="2 core / 4 GB / 20 GB SSD" />
        <Stat label="Mata uang" value={formula.currency} sub="format Rupiah" />
        <Stat label="Komponen" value={String(Object.keys(LABELS).length)} sub="dapat disesuaikan" />
      </div>

      <Card>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((key) => (
            <Field key={key} label={LABELS[key]} htmlFor={`pf-${key}`}>
              <input
                id={`pf-${key}`}
                type="number"
                min={0}
                className="input"
                value={formula[key]}
                onChange={(e) => setFormula({ ...formula, [key]: Number(e.target.value) })}
              />
            </Field>
          ))}
        </div>
      </Card>

      <Button size="lg" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Simpan Formula
      </Button>
    </div>
  );
}
