"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { Settings } from "@/lib/types";
import { Button, Card, Field } from "@/components/ui";
import { cn } from "@/lib/utils";

type Section = "theme" | "social" | "maintenance" | "pages";

export function SettingsModule({ initial, section }: { initial: Settings; section: Section }) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: { settings } }),
      });
      const json = await res.json();
      setMessage(
        json.ok
          ? { tone: "ok", text: "Pengaturan tersimpan. Muat ulang halaman publik untuk melihat perubahan." }
          : { tone: "err", text: json.error as string },
      );
    } catch {
      setMessage({ tone: "err", text: "Gagal menyimpan pengaturan." });
    } finally {
      setSaving(false);
    }
  }

  const set = (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch }));

  const titles: Record<Section, [string, string]> = {
    theme: ["Tema & Branding", "Ubah logo, favicon, maskot, judul situs, hero, footer, dan warna merek."],
    social: ["Sosial & Kontak", "Kelola tautan komunitas dan informasi kontak yang tampil di seluruh situs."],
    maintenance: ["Mode Maintenance", "Aktifkan untuk menutup pemesanan sementara dan menampilkan pesan khusus."],
    pages: ["Halaman & Legal", "Sunting konten halaman Tentang dan seluruh dokumen legal dalam format Markdown."],
  };

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black">{titles[section][0]}</h1>
        <p className="mt-1 text-sm text-[#a99fc8]">{titles[section][1]}</p>
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

      {section === "theme" ? (
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Judul Situs" htmlFor="s-title">
              <input id="s-title" className="input" value={settings.siteTitle} onChange={(e) => set({ siteTitle: e.target.value })} />
            </Field>
            <Field label="Tagline" htmlFor="s-tagline">
              <input id="s-tagline" className="input" value={settings.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </Field>
            <Field label="Logo (path/URL)" htmlFor="s-logo">
              <input id="s-logo" className="input" value={settings.logo} onChange={(e) => set({ logo: e.target.value })} />
            </Field>
            <Field label="Favicon (path/URL)" htmlFor="s-fav">
              <input id="s-fav" className="input" value={settings.favicon} onChange={(e) => set({ favicon: e.target.value })} />
            </Field>
            <Field label="Maskot / OG Image" htmlFor="s-mascot">
              <input id="s-mascot" className="input" value={settings.mascot} onChange={(e) => set({ mascot: e.target.value })} />
            </Field>
            <Field label="Badge Hero" htmlFor="s-badge">
              <input id="s-badge" className="input" value={settings.heroBadge} onChange={(e) => set({ heroBadge: e.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Judul Hero" htmlFor="s-hero">
                <input id="s-hero" className="input" value={settings.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Subjudul Hero" htmlFor="s-herosub">
                <textarea id="s-herosub" rows={3} className="input resize-y" value={settings.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Deskripsi SEO" htmlFor="s-desc">
                <textarea id="s-desc" rows={3} className="input resize-y" value={settings.description} onChange={(e) => set({ description: e.target.value })} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Teks Footer" htmlFor="s-footer">
                <textarea id="s-footer" rows={2} className="input resize-y" value={settings.footerText} onChange={(e) => set({ footerText: e.target.value })} />
              </Field>
            </div>
            {(["brand", "brand2", "brand3", "accent"] as const).map((key) => (
              <Field key={key} label={`Warna ${key}`} htmlFor={`s-${key}`}>
                <div className="flex gap-2">
                  <input
                    type="color"
                    aria-label={`Pemilih warna ${key}`}
                    className="h-12 w-14 cursor-pointer rounded-xl border-[3px] border-black bg-transparent"
                    value={settings.theme[key]}
                    onChange={(e) => set({ theme: { ...settings.theme, [key]: e.target.value } })}
                  />
                  <input
                    id={`s-${key}`}
                    className="input"
                    value={settings.theme[key]}
                    onChange={(e) => set({ theme: { ...settings.theme, [key]: e.target.value } })}
                  />
                </div>
              </Field>
            ))}
          </div>
        </Card>
      ) : null}

      {section === "social" ? (
        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            {(Object.keys(settings.social) as (keyof Settings["social"])[]).map((key) => (
              <Field key={key} label={key} htmlFor={`soc-${key}`}>
                <input
                  id={`soc-${key}`}
                  className="input"
                  value={settings.social[key]}
                  onChange={(e) => set({ social: { ...settings.social, [key]: e.target.value } })}
                />
              </Field>
            ))}
            {(Object.keys(settings.contact) as (keyof Settings["contact"])[]).map((key) => (
              <Field key={key} label={`Kontak: ${key}`} htmlFor={`con-${key}`}>
                <input
                  id={`con-${key}`}
                  className="input"
                  value={settings.contact[key]}
                  onChange={(e) => set({ contact: { ...settings.contact, [key]: e.target.value } })}
                />
              </Field>
            ))}
          </div>
        </Card>
      ) : null}

      {section === "maintenance" ? (
        <Card>
          <button
            type="button"
            role="switch"
            aria-checked={settings.maintenance}
            onClick={() => set({ maintenance: !settings.maintenance })}
            className={cn(
              "rounded-2xl border-[3px] border-black px-6 py-4 text-sm font-black uppercase shadow-[4px_4px_0_0_#000]",
              settings.maintenance ? "bg-[#f43f5e] text-white" : "bg-[#c3ff3e] text-black",
            )}
          >
            {settings.maintenance ? "Maintenance AKTIF — pemesanan ditutup" : "Layanan normal — pemesanan terbuka"}
          </button>
          <div className="mt-6">
            <Field label="Pesan Maintenance" htmlFor="s-maint">
              <textarea
                id="s-maint"
                rows={4}
                className="input resize-y"
                value={settings.maintenanceMessage}
                onChange={(e) => set({ maintenanceMessage: e.target.value })}
              />
            </Field>
          </div>
        </Card>
      ) : null}

      {section === "pages" ? (
        <div className="space-y-6">
          <Card>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-black">Halaman Tentang</h2>
            <div className="mt-5 space-y-5">
              <Field label="Cerita" htmlFor="a-story">
                <textarea
                  id="a-story"
                  rows={6}
                  className="input resize-y"
                  value={settings.about.story}
                  onChange={(e) => set({ about: { ...settings.about, story: e.target.value } })}
                />
              </Field>
              <Field label="Visi" htmlFor="a-vision">
                <textarea
                  id="a-vision"
                  rows={3}
                  className="input resize-y"
                  value={settings.about.vision}
                  onChange={(e) => set({ about: { ...settings.about, vision: e.target.value } })}
                />
              </Field>
              <Field label="Misi (satu per baris)" htmlFor="a-mission">
                <textarea
                  id="a-mission"
                  rows={5}
                  className="input resize-y"
                  value={settings.about.mission.join("\n")}
                  onChange={(e) =>
                    set({ about: { ...settings.about, mission: e.target.value.split("\n").filter(Boolean) } })
                  }
                />
              </Field>
              <Field label="Teknologi (satu per baris)" htmlFor="a-tech">
                <textarea
                  id="a-tech"
                  rows={5}
                  className="input resize-y"
                  value={settings.about.tech.join("\n")}
                  onChange={(e) => set({ about: { ...settings.about, tech: e.target.value.split("\n").filter(Boolean) } })}
                />
              </Field>
              <Field label="Tim (JSON)" htmlFor="a-team">
                <textarea
                  id="a-team"
                  rows={8}
                  className="input resize-y font-mono text-xs"
                  value={JSON.stringify(settings.about.team, null, 2)}
                  onChange={(e) => {
                    try {
                      set({ about: { ...settings.about, team: JSON.parse(e.target.value) } });
                    } catch {
                      /* keep typing until JSON is valid */
                    }
                  }}
                />
              </Field>
            </div>
          </Card>

          {Object.entries(settings.legal).map(([slug, doc]) => (
            <Card key={slug}>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-black">{doc.title}</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Judul" htmlFor={`lg-t-${slug}`}>
                  <input
                    id={`lg-t-${slug}`}
                    className="input"
                    value={doc.title}
                    onChange={(e) =>
                      set({ legal: { ...settings.legal, [slug]: { ...doc, title: e.target.value } } })
                    }
                  />
                </Field>
                <Field label="Diperbarui (YYYY-MM-DD)" htmlFor={`lg-u-${slug}`}>
                  <input
                    id={`lg-u-${slug}`}
                    className="input"
                    value={doc.updatedAt}
                    onChange={(e) =>
                      set({ legal: { ...settings.legal, [slug]: { ...doc, updatedAt: e.target.value } } })
                    }
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Isi (Markdown)" htmlFor={`lg-b-${slug}`}>
                    <textarea
                      id={`lg-b-${slug}`}
                      rows={12}
                      className="input resize-y font-mono text-xs"
                      value={doc.body}
                      onChange={(e) =>
                        set({ legal: { ...settings.legal, [slug]: { ...doc, body: e.target.value } } })
                      }
                    />
                  </Field>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <Button size="lg" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Simpan Perubahan
      </Button>
    </div>
  );
}
