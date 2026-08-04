"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Order, Ticket } from "@/lib/types";
import { formatIDR } from "@/lib/pricing";
import { Card, Stat } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface Customer {
  email: string;
  name: string;
  whatsapp: string;
  orders: number;
  spent: number;
  tickets: number;
  lastOrderAt: string;
}

export function CustomersModule({ orders, tickets }: { orders: Order[]; tickets: Ticket[] }) {
  const [query, setQuery] = useState("");

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const key = o.customer.email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orders += 1;
        existing.spent += o.total;
        if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
      } else {
        map.set(key, {
          email: o.customer.email,
          name: o.customer.name,
          whatsapp: o.customer.whatsapp,
          orders: 1,
          spent: o.total,
          tickets: 0,
          lastOrderAt: o.createdAt,
        });
      }
    }
    for (const t of tickets) {
      const key = t.email.toLowerCase();
      const existing = map.get(key);
      if (existing) existing.tickets += 1;
      else
        map.set(key, {
          email: t.email,
          name: t.name,
          whatsapp: "-",
          orders: 0,
          spent: 0,
          tickets: 1,
          lastOrderAt: t.createdAt,
        });
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders, tickets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => `${c.name} ${c.email} ${c.whatsapp}`.toLowerCase().includes(q));
  }, [customers, query]);

  const totalSpent = customers.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black">Pelanggan</h1>
        <p className="mt-1 text-sm text-[#a99fc8]">
          Daftar agregat dibentuk otomatis dari pesanan dan tiket berdasarkan alamat email.
        </p>
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6690]" />
          <input
            type="search"
            className="input pl-11"
            placeholder="Cari nama, email, atau WhatsApp…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari pelanggan"
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total pelanggan" value={String(customers.length)} />
        <Stat label="Nilai keseluruhan" value={formatIDR(totalSpent)} />
        <Stat
          label="Rata-rata per pelanggan"
          value={formatIDR(customers.length ? Math.round(totalSpent / customers.length) : 0)}
        />
      </div>

      <Card className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#a99fc8]">Belum ada pelanggan.</p>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b-[3px] border-black bg-[#1b1233] text-left">
                <th className="p-3 font-black">Nama</th>
                <th className="p-3 font-black">Email</th>
                <th className="p-3 font-black">WhatsApp</th>
                <th className="p-3 font-black">Pesanan</th>
                <th className="p-3 font-black">Nilai</th>
                <th className="p-3 font-black">Tiket</th>
                <th className="p-3 font-black">Aktivitas terakhir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.email} className="border-b-2 border-[#241645]">
                  <td className="p-3 font-bold">{c.name}</td>
                  <td className="p-3 text-[#cdc3ea]">{c.email}</td>
                  <td className="p-3 text-[#cdc3ea]">{c.whatsapp}</td>
                  <td className="p-3 text-[#cdc3ea]">{c.orders}</td>
                  <td className="p-3 font-black text-[#c3ff3e]">{formatIDR(c.spent)}</td>
                  <td className="p-3 text-[#cdc3ea]">{c.tickets}</td>
                  <td className="p-3 text-[#8d83ad]">{formatDateTime(c.lastOrderAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
