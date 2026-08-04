"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";
import { Badge, Button, Card, Field } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface FieldSpec {
  name: string;
  label: string;
  type: "text" | "textarea" | "markdown" | "number" | "boolean" | "select" | "tags" | "json";
  options?: string[];
  required?: boolean;
  readOnly?: boolean;
  step?: number;
}

type Row = Record<string, unknown>;

interface Props {
  title: string;
  description: string;
  resource: string;
  idField: string;
  fields: FieldSpec[];
  columns: string[];
  initialItems: Row[];
  allowCreate?: boolean;
}

function blank(fields: FieldSpec[]): Row {
  const row: Row = {};
  for (const f of fields) {
    row[f.name] =
      f.type === "boolean" ? false : f.type === "number" ? 0 : f.type === "tags" || f.type === "json" ? [] : "";
  }
  return row;
}

function display(value: unknown): string {
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).length > 60 ? `${String(value).slice(0, 60)}…` : String(value);
}

export function CollectionModule({
  title,
  description,
  resource,
  idField,
  fields,
  columns,
  initialItems,
  allowCreate = true,
}: Props) {
  const [items, setItems] = useState<Row[]>(initialItems);
  const [editing, setEditing] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [items, query]);

  async function refresh() {
    const res = await fetch(`/api/admin/${resource}`, { cache: "no-store" });
    const json = await res.json();
    if (json.ok) setItems(json.data.items as Row[]);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: editing }),
      });
      const json = await res.json();
      if (json.ok) {
        await refresh();
        setEditing(null);
        setMessage({ tone: "ok", text: "Perubahan tersimpan." });
      } else {
        setMessage({ tone: "err", text: json.error as string });
      }
    } catch {
      setMessage({ tone: "err", text: "Gagal menyimpan. Periksa koneksi Anda." });
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    const key = String(row[idField]);
    if (!confirm(`Hapus "${key}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    const res = await fetch(`/api/admin/${resource}?id=${encodeURIComponent(key)}`, { method: "DELETE" });
    const json = await res.json();
    if (json.ok) {
      await refresh();
      setMessage({ tone: "ok", text: `"${key}" dihapus.` });
    } else {
      setMessage({ tone: "err", text: json.error as string });
    }
  }

  function update(name: string, value: unknown) {
    setEditing((prev) => (prev ? { ...prev, [name]: value } : prev));
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-black">{title}</h1>
            <p className="mt-1 text-sm text-[#a99fc8]">{description}</p>
          </div>
          {allowCreate ? (
            <Button
              size="sm"
              onClick={() => {
                setEditing(blank(fields));
                setIsNew(true);
              }}
            >
              <Plus className="h-4 w-4" /> Tambah
            </Button>
          ) : null}
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6690]" />
          <input
            type="search"
            className="input pl-11"
            placeholder="Cari…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={`Cari ${title}`}
          />
        </div>

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

      {editing ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-black">
              {isNew ? "Tambah data baru" : `Ubah ${String(editing[idField] ?? "")}`}
            </h2>
            <button type="button" onClick={() => setEditing(null)} aria-label="Tutup editor">
              <X className="h-5 w-5 text-[#a99fc8]" />
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {fields.map((f) => {
              const full = f.type === "textarea" || f.type === "markdown" || f.type === "json";
              const value = editing[f.name];
              return (
                <div key={f.name} className={full ? "md:col-span-2" : ""}>
                  <Field label={f.label} htmlFor={`f-${f.name}`}>
                    {f.type === "boolean" ? (
                      <button
                        id={`f-${f.name}`}
                        type="button"
                        role="switch"
                        aria-checked={Boolean(value)}
                        onClick={() => update(f.name, !value)}
                        className={cn(
                          "rounded-xl border-[3px] border-black px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#000]",
                          value ? "bg-[#c3ff3e] text-black" : "bg-[#150f28] text-[#8d83ad]",
                        )}
                      >
                        {value ? "Aktif" : "Nonaktif"}
                      </button>
                    ) : f.type === "select" ? (
                      <select
                        id={`f-${f.name}`}
                        className="input"
                        value={String(value ?? "")}
                        onChange={(e) => update(f.name, e.target.value)}
                      >
                        {(f.options ?? []).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "number" ? (
                      <input
                        id={`f-${f.name}`}
                        type="number"
                        step={f.step ?? 1}
                        className="input"
                        value={Number(value ?? 0)}
                        onChange={(e) => update(f.name, Number(e.target.value))}
                      />
                    ) : f.type === "tags" ? (
                      <input
                        id={`f-${f.name}`}
                        className="input"
                        value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
                        onChange={(e) =>
                          update(
                            f.name,
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                      />
                    ) : f.type === "json" ? (
                      <textarea
                        id={`f-${f.name}`}
                        rows={6}
                        className="input font-mono text-xs"
                        value={typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2)}
                        onChange={(e) => {
                          try {
                            update(f.name, JSON.parse(e.target.value));
                          } catch {
                            update(f.name, e.target.value);
                          }
                        }}
                      />
                    ) : f.type === "textarea" || f.type === "markdown" ? (
                      <textarea
                        id={`f-${f.name}`}
                        rows={f.type === "markdown" ? 14 : 4}
                        className={cn("input resize-y", f.type === "markdown" && "font-mono text-xs")}
                        value={String(value ?? "")}
                        onChange={(e) => update(f.name, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`f-${f.name}`}
                        className="input"
                        readOnly={f.readOnly}
                        required={f.required}
                        value={String(value ?? "")}
                        onChange={(e) => update(f.name, e.target.value)}
                      />
                    )}
                  </Field>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Batal
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#a99fc8]">Belum ada data.</p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b-[3px] border-black bg-[#1b1233] text-left">
                {columns.map((c) => (
                  <th key={c} className="p-3 font-black capitalize">
                    {fields.find((f) => f.name === c)?.label ?? c}
                  </th>
                ))}
                <th className="p-3 text-right font-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={String(row[idField] ?? i)} className="border-b-2 border-[#241645]">
                  {columns.map((c) => (
                    <td key={c} className="p-3 text-[#cdc3ea]">
                      {typeof row[c] === "boolean" ? (
                        <Badge tone={row[c] ? "lime" : "muted"}>{row[c] ? "Ya" : "Tidak"}</Badge>
                      ) : (
                        display(row[c])
                      )}
                    </td>
                  ))}
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing({ ...blank(fields), ...row });
                          setIsNew(false);
                        }}
                        aria-label="Ubah"
                        className="rounded-lg border-2 border-black bg-[#1b1233] p-2 hover:bg-[#2a1a4f]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row)}
                        aria-label="Hapus"
                        className="rounded-lg border-2 border-black bg-[#f43f5e] p-2 text-white hover:bg-[#fb5c76]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
