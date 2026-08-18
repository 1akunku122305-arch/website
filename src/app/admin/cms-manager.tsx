'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label, Select, Checkbox, Switch } from '@/components/ui/field';
import { Badge, Card, CardContent, EmptyState, LoadingState, ErrorState, Alert } from '@/components/ui/display';
import { Modal } from '@/components/ui/overlay';
import { useToast } from '@/components/ui/toast';
import { getOrCreateCsrfToken } from '@/lib/client-csrf';
import { formatDateTime } from '@/lib/utils';

interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'tags' | 'date' | 'number';
  options?: Array<string | { value: string; label: string }>;
  required?: boolean;
}

export interface ResourceConfig {
  resourceKey: string;
  title: string;
  description: string;
  fields: FieldDef[];
  labelField: string;
  statusField?: string;
  statusActive?: string;
}

export function CmsManager({ config }: { config: ResourceConfig }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Array<Record<string, unknown>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/cms/${config.resourceKey}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memuat.');
      setItems(data.data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
    }
  }, [config.resourceKey]);

  useEffect(() => {
    load();
  }, [load]);

  function emptyForm(): Record<string, unknown> {
    const f: Record<string, unknown> = {};
    for (const field of config.fields) {
      if (field.type === 'checkbox' || field.type === 'switch') f[field.name] = false;
      else if (field.type === 'tags') f[field.name] = [];
      else if (field.type === 'select' && field.options?.length) f[field.name] = field.options[0];
      else f[field.name] = '';
    }
    return f;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editing?.id
          ? `/api/admin/cms/${config.resourceKey}/${editing.id}`
          : `/api/admin/cms/${config.resourceKey}`,
        {
          method: editing?.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': await getOrCreateCsrfToken() },
          body: JSON.stringify(editing),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan.');
      toast('Berhasil disimpan.', 'success');
      setEditing(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Record<string, unknown>) {
    if (!item.id) return;
    if (!window.confirm('Hapus item ini?')) return;
    try {
      const res = await fetch(`/api/admin/cms/${config.resourceKey}/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': await getOrCreateCsrfToken() },
      });
      if (!res.ok) throw new Error('Gagal menghapus.');
      toast('Item dihapus.', 'success');
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Gagal menghapus.', 'error');
    }
  }

  if (error) return <ErrorState title="Gagal memuat" message={error} retry={load} />;
  if (!items) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{config.description}</p>
        </div>
        <Button onClick={() => setEditing(emptyForm())}>Tambah Baru</Button>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Belum ada data" description="Tambahkan item pertama." />
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {items.map((item) => (
            <Card key={String(item.id)}>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{String(item[config.labelField] ?? item.id ?? '')}</p>
                    {config.statusField && (
                      <Badge variant={item[config.statusField] === config.statusActive ? 'success' : 'neutral'}>
                        {String(item[config.statusField] ?? '')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditing({ ...item })}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => remove(item)}>
                      Hapus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? 'Edit' : 'Tambah Baru'}>
        {editing && (
          <form onSubmit={save} className="space-y-3">
            {config.fields.map((f) => <Field key={f.name} field={f} value={editing[f.name]} onChange={(v) => setEditing((e) => ({ ...e, [f.name]: v }))} />)}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Batal</Button>
              <Button type="submit" loading={saving}>Simpan</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const strVal = typeof value === 'string' ? value : value == null ? '' : String(value);
  const boolVal = Boolean(value);

  switch (field.type) {
    case 'textarea':
      return (
        <div>
          <Label htmlFor={field.name}>{field.label}</Label>
          <Textarea id={field.name} value={strVal} onChange={(e) => onChange(e.target.value)} required={field.required} />
        </div>
      );
    case 'select':
      return (
        <div>
          <Label htmlFor={field.name}>{field.label}</Label>
          <Select id={field.name} value={strVal} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((o) => {
              const value = typeof o === 'string' ? o : o.value;
              const label = typeof o === 'string' ? o : o.label;
              return <option key={value} value={value}>{label}</option>;
            })}
          </Select>
        </div>
      );
    case 'checkbox':
      return <Checkbox label={field.label} checked={boolVal} onChange={(e) => onChange(e.target.checked)} />;
    case 'switch':
      return <Switch label={field.label} checked={boolVal} onChange={onChange} />;
    case 'tags': {
      const tags = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label>{field.label}</Label>
          <Input
            value={tags.join(', ')}
            onChange={(e) =>
              onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
            }
            placeholder="Dipisahkan koma"
          />
        </div>
      );
    }
    case 'number':
      return (
        <div>
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input id={field.name} type="number" value={strVal} onChange={(e) => onChange(Number(e.target.value) || 0)} />
        </div>
      );
    case 'date':
      return (
        <div>
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input id={field.name} type="datetime-local" value={toLocalInput(strVal)} onChange={(e) => onChange(new Date(e.target.value).toISOString())} />
        </div>
      );
    default:
      return (
        <div>
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input id={field.name} value={strVal} onChange={(e) => onChange(e.target.value)} required={field.required} />
        </div>
      );
  }
}

function toLocalInput(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
