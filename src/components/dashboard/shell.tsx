"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  Calculator,
  FileText,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  Newspaper,
  Palette,
  ScrollText,
  Server,
  Share2,
  ShieldAlert,
  ShoppingCart,
  Star,
  Tag,
  Users,
} from "lucide-react";
import type { Database, Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OverviewModule } from "./modules/overview";
import { CollectionModule, type FieldSpec } from "./modules/collection";
import { SettingsModule } from "./modules/settings";
import { PriceFormulaModule } from "./modules/price-formula";
import { AuditModule } from "./modules/audit";
import { CustomersModule } from "./modules/customers";
import { PVNodeFormulaModule } from "./modules/pvnode-formula";
import { VPSFormulaModule } from "./modules/vps-formula";
import { SharedHostingModule } from "./modules/shared-hosting";
import { DedicatedServerModule } from "./modules/dedicated-server";
import { PVNodePackagesModule } from "./modules/pvnode-packages";
import { VPSPackagesModule } from "./modules/vps-packages";
import { OtherServicesModule } from "./modules/other-services";
import { MediaManagerModule } from "./modules/media-manager";
import { StockManagementModule } from "./modules/stock-management";

export interface ModuleDef {
  id: string;
  label: string;
  group: string;
  icon: typeof LayoutDashboard;
  minRole: Role;
}

const MODULES: ModuleDef[] = [
  { id: "overview", label: "Ringkasan", group: "Utama", icon: LayoutDashboard, minRole: "STAFF" },
  { id: "orders", label: "Pesanan", group: "Utama", icon: ShoppingCart, minRole: "STAFF" },
  { id: "customers", label: "Pelanggan", group: "Utama", icon: Users, minRole: "STAFF" },
  { id: "tickets", label: "Tiket & Kontak", group: "Utama", icon: LifeBuoy, minRole: "STAFF" },
  { id: "priceFormula", label: "Formula Harga", group: "Komersial", icon: Calculator, minRole: "ADMIN" },
  { id: "pvnodeFormula", label: "PVNode Formula", group: "Komersial", icon: Calculator, minRole: "ADMIN" },
  { id: "vpsFormula", label: "VPS Formula", group: "Komersial", icon: Calculator, minRole: "ADMIN" },
  { id: "coupons", label: "Kupon & Promo", group: "Komersial", icon: Tag, minRole: "ADMIN" },
  { id: "sharedHosting", label: "Shared Hosting", group: "Produk", icon: Boxes, minRole: "ADMIN" },
  { id: "botHosting", label: "Bot Hosting", group: "Produk", icon: Boxes, minRole: "ADMIN" },
  { id: "dedicatedServer", label: "Dedicated Server", group: "Produk", icon: Server, minRole: "ADMIN" },
  { id: "pvnodePackages", label: "PVNode Packages", group: "Produk", icon: Boxes, minRole: "ADMIN" },
  { id: "vpsPackages", label: "VPS Packages", group: "Produk", icon: Boxes, minRole: "ADMIN" },
  { id: "otherServices", label: "Other Services", group: "Produk", icon: Boxes, minRole: "ADMIN" },
  { id: "mediaManager", label: "Media Manager", group: "Pengaturan", icon: Palette, minRole: "ADMIN" },
  { id: "stockManagement", label: "Stock Management", group: "Produk", icon: Server, minRole: "ADMIN" },
  { id: "analytics", label: "Analitik", group: "Komersial", icon: BarChart3, minRole: "STAFF" },
  { id: "posts", label: "Blog", group: "Konten", icon: Newspaper, minRole: "ADMIN" },
  { id: "articles", label: "Knowledge Base", group: "Konten", icon: FileText, minRole: "ADMIN" },
  { id: "faqs", label: "FAQ", group: "Konten", icon: ScrollText, minRole: "ADMIN" },
  { id: "testimonials", label: "Testimoni", group: "Konten", icon: Star, minRole: "ADMIN" },
  { id: "pages", label: "Halaman & Legal", group: "Konten", icon: FileText, minRole: "ADMIN" },
  { id: "nodes", label: "Infrastruktur", group: "Operasional", icon: Server, minRole: "ADMIN" },
  { id: "regions", label: "Lokasi Server", group: "Operasional", icon: Globe2, minRole: "ADMIN" },
  { id: "incidents", label: "Insiden & Maintenance", group: "Operasional", icon: ShieldAlert, minRole: "ADMIN" },
  { id: "announcements", label: "Pengumuman", group: "Operasional", icon: Megaphone, minRole: "ADMIN" },
  { id: "theme", label: "Tema & Branding", group: "Pengaturan", icon: Palette, minRole: "ADMIN" },
  { id: "social", label: "Sosial & Kontak", group: "Pengaturan", icon: Share2, minRole: "ADMIN" },
  { id: "maintenance", label: "Mode Maintenance", group: "Pengaturan", icon: Bell, minRole: "ADMIN" },
  { id: "audit", label: "Audit Log", group: "Pengaturan", icon: Boxes, minRole: "STAFF" },
];

const RANK: Record<Role, number> = { STAFF: 1, ADMIN: 2, OWNER: 3 };

const COUPON_FIELDS: FieldSpec[] = [
  { name: "code", label: "Kode", type: "text", required: true },
  { name: "type", label: "Tipe", type: "select", options: ["PERCENT", "FIXED"] },
  { name: "value", label: "Nilai", type: "number" },
  { name: "maxUses", label: "Kuota (0 = tanpa batas)", type: "number" },
  { name: "uses", label: "Terpakai", type: "number" },
  { name: "expiresAt", label: "Kedaluwarsa (ISO)", type: "text" },
  { name: "active", label: "Aktif", type: "boolean" },
  { name: "description", label: "Deskripsi", type: "textarea" },
];

const POST_FIELDS: FieldSpec[] = [
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "title", label: "Judul", type: "text", required: true },
  { name: "category", label: "Kategori", type: "text" },
  { name: "tags", label: "Tag (pisahkan koma)", type: "tags" },
  { name: "author", label: "Penulis", type: "text" },
  { name: "publishedAt", label: "Tanggal terbit (YYYY-MM-DD)", type: "text" },
  { name: "excerpt", label: "Ringkasan", type: "textarea" },
  { name: "body", label: "Isi (Markdown)", type: "markdown" },
  { name: "published", label: "Terbit", type: "boolean" },
];

const ARTICLE_FIELDS: FieldSpec[] = [
  { name: "slug", label: "Slug", type: "text", required: true },
  { name: "title", label: "Judul", type: "text", required: true },
  { name: "category", label: "Kategori", type: "text" },
  { name: "updatedAt", label: "Diperbarui (YYYY-MM-DD)", type: "text" },
  { name: "body", label: "Isi (Markdown)", type: "markdown" },
];

const FAQ_FIELDS: FieldSpec[] = [
  { name: "id", label: "ID", type: "text" },
  { name: "category", label: "Kategori", type: "text" },
  { name: "question", label: "Pertanyaan", type: "text", required: true },
  { name: "answer", label: "Jawaban", type: "textarea" },
];

const NODE_FIELDS: FieldSpec[] = [
  { name: "id", label: "ID", type: "text", required: true },
  { name: "name", label: "Nama", type: "text", required: true },
  { name: "region", label: "Region", type: "text" },
  { name: "status", label: "Status", type: "select", options: ["OPERATIONAL", "DEGRADED", "MAINTENANCE", "DOWN"] },
  { name: "uptime30d", label: "Uptime 30 hari (%)", type: "number" },
  { name: "cpu", label: "CPU", type: "text" },
  { name: "ram", label: "RAM", type: "text" },
  { name: "storage", label: "Storage", type: "text" },
  { name: "network", label: "Jaringan", type: "text" },
];

const REGION_FIELDS: FieldSpec[] = [
  { name: "id", label: "ID", type: "text", required: true },
  { name: "name", label: "Nama", type: "text", required: true },
  { name: "flag", label: "Emoji bendera", type: "text" },
  { name: "city", label: "Kota", type: "text" },
  { name: "latencyMs", label: "Latensi (ms)", type: "number" },
  { name: "priceMultiplier", label: "Pengali harga", type: "number", step: 0.01 },
  { name: "enabled", label: "Aktif", type: "boolean" },
];

const INCIDENT_FIELDS: FieldSpec[] = [
  { name: "id", label: "ID", type: "text" },
  { name: "title", label: "Judul", type: "text", required: true },
  { name: "severity", label: "Tingkat", type: "select", options: ["MINOR", "MAJOR", "CRITICAL", "MAINTENANCE"] },
  { name: "startedAt", label: "Mulai (ISO)", type: "text" },
  { name: "resolvedAt", label: "Selesai (ISO, kosongkan bila aktif)", type: "text" },
  { name: "affected", label: "Node terdampak (koma)", type: "tags" },
  { name: "updates", label: "Kronologi (JSON)", type: "json" },
];

const ANNOUNCEMENT_FIELDS: FieldSpec[] = [
  { name: "id", label: "ID", type: "text" },
  { name: "body", label: "Isi", type: "textarea", required: true },
  { name: "level", label: "Level", type: "select", options: ["INFO", "WARN", "SUCCESS"] },
  { name: "active", label: "Aktif", type: "boolean" },
];

const TESTIMONIAL_FIELDS: FieldSpec[] = [
  { name: "name", label: "Nama", type: "text", required: true },
  { name: "role", label: "Peran", type: "text" },
  { name: "rating", label: "Rating (1-5)", type: "number" },
  { name: "body", label: "Isi", type: "textarea" },
];

const ORDER_FIELDS: FieldSpec[] = [
  { name: "id", label: "ID", type: "text", readOnly: true },
  { name: "status", label: "Status", type: "select", options: ["NEW", "CONTACTED", "PAID", "ACTIVE", "CANCELLED"] },
  { name: "serverName", label: "Nama server", type: "text" },
  { name: "notes", label: "Catatan", type: "textarea" },
  { name: "total", label: "Total", type: "number" },
];

const TICKET_FIELDS: FieldSpec[] = [
  { name: "id", label: "ID", type: "text", readOnly: true },
  { name: "status", label: "Status", type: "select", options: ["OPEN", "ANSWERED", "CLOSED"] },
  { name: "subject", label: "Subjek", type: "text" },
  { name: "message", label: "Pesan", type: "textarea" },
  { name: "replies", label: "Balasan (JSON)", type: "json" },
];

export function DashboardShell({
  initial,
  session,
}: {
  initial: Database;
  session: { name: string; email: string; role: Role };
}) {
  const router = useRouter();
  const [active, setActive] = useState("overview");
  const [navOpen, setNavOpen] = useState(false);

  const allowed = useMemo(
    () => MODULES.filter((m) => RANK[session.role] >= RANK[m.minRole]),
    [session.role],
  );
  const groups = useMemo(() => [...new Set(allowed.map((m) => m.group))], [allowed]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-[110rem] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr]">
      <aside className={cn("lg:block", navOpen ? "block" : "hidden")}>
        <div className="brut glass sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-4">
          <div className="rounded-xl border-2 border-black bg-[#1b1233] p-3">
            <p className="text-sm font-black">{session.name}</p>
            <p className="text-xs text-[#8d83ad]">{session.email}</p>
            <span className="mt-2 inline-block rounded-full border-2 border-black bg-[#c3ff3e] px-2 py-0.5 text-[10px] font-black uppercase text-black">
              {session.role}
            </span>
          </div>

          {groups.map((group) => (
            <div key={group} className="mt-5">
              <p className="label px-2">{group}</p>
              <ul className="mt-2 space-y-1">
                {allowed
                  .filter((m) => m.group === group)
                  .map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActive(m.id);
                          setNavOpen(false);
                        }}
                        aria-current={active === m.id}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors",
                          active === m.id ? "bg-[#241645] text-[#c3ff3e]" : "text-[#cdc3ea] hover:bg-[#1b1233]",
                        )}
                      >
                        <m.icon className="h-4 w-4 shrink-0" />
                        {m.label}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          <button
            type="button"
            onClick={logout}
            className="mt-6 flex w-full items-center gap-2 rounded-xl border-[3px] border-black bg-[#f43f5e] px-3 py-2.5 text-sm font-black uppercase text-white shadow-[3px_3px_0_0_#000] transition-transform hover:-translate-y-0.5"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      <div>
        <button
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          className="mb-4 w-full rounded-2xl border-[3px] border-black bg-[#1b1233] px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0_0_#000] lg:hidden"
        >
          {navOpen ? "Tutup Menu" : "Menu Dashboard"}
        </button>

        {active === "overview" ? <OverviewModule db={initial} onNavigate={setActive} /> : null}
        {active === "orders" ? (
          <CollectionModule
            title="Pesanan"
            description="Kelola status pesanan masuk dan catat tindak lanjut pembayaran."
            resource="orders"
            idField="id"
            fields={ORDER_FIELDS}
            columns={["id", "status", "serverName", "total"]}
            initialItems={initial.orders as never[]}
            allowCreate={false}
          />
        ) : null}
        {active === "customers" ? <CustomersModule orders={initial.orders} tickets={initial.tickets} /> : null}
        {active === "tickets" ? (
          <CollectionModule
            title="Tiket & Kontak"
            description="Semua pesan dari formulir kontak masuk ke sini sebagai tiket."
            resource="tickets"
            idField="id"
            fields={TICKET_FIELDS}
            columns={["id", "status", "subject", "email"]}
            initialItems={initial.tickets as never[]}
            allowCreate={false}
          />
        ) : null}
        {active === "priceFormula" ? <PriceFormulaModule initial={initial.priceFormula} /> : null}
        {active === "pvnodeFormula" ? <PVNodeFormulaModule /> : null}
        {active === "vpsFormula" ? <VPSFormulaModule /> : null}
        {active === "sharedHosting" ? <SharedHostingModule /> : null}
        {active === "botHosting" ? <SharedHostingModule /> : null}
        {active === "dedicatedServer" ? <DedicatedServerModule /> : null}
        {active === "pvnodePackages" ? <PVNodePackagesModule /> : null}
        {active === "vpsPackages" ? <VPSPackagesModule /> : null}
        {active === "otherServices" ? <OtherServicesModule /> : null}
        {active === "mediaManager" ? <MediaManagerModule /> : null}
        {active === "stockManagement" ? <StockManagementModule /> : null}
        {active === "coupons" ? (
          <CollectionModule
            title="Kupon & Promosi"
            description="Buat kode diskon persentase atau nominal tetap dengan kuota dan masa berlaku."
            resource="coupons"
            idField="code"
            fields={COUPON_FIELDS}
            columns={["code", "type", "value", "uses", "active"]}
            initialItems={initial.coupons as never[]}
          />
        ) : null}
        {active === "analytics" ? <OverviewModule db={initial} onNavigate={setActive} analyticsOnly /> : null}
        {active === "posts" ? (
          <CollectionModule
            title="Blog"
            description="Tulis artikel dalam Markdown lengkap dengan kategori, tag, dan status terbit."
            resource="posts"
            idField="slug"
            fields={POST_FIELDS}
            columns={["title", "category", "publishedAt", "published"]}
            initialItems={initial.posts as never[]}
          />
        ) : null}
        {active === "articles" ? (
          <CollectionModule
            title="Knowledge Base"
            description="Dokumentasi teknis untuk pelanggan."
            resource="articles"
            idField="slug"
            fields={ARTICLE_FIELDS}
            columns={["title", "category", "updatedAt"]}
            initialItems={initial.articles as never[]}
          />
        ) : null}
        {active === "faqs" ? (
          <CollectionModule
            title="FAQ"
            description="Pertanyaan umum yang tampil di beranda dan halaman FAQ."
            resource="faqs"
            idField="id"
            fields={FAQ_FIELDS}
            columns={["question", "category"]}
            initialItems={initial.faqs as never[]}
          />
        ) : null}
        {active === "testimonials" ? (
          <CollectionModule
            title="Testimoni"
            description="Ulasan pelanggan yang tampil di beranda dan halaman testimoni."
            resource="testimonials"
            idField="name"
            fields={TESTIMONIAL_FIELDS}
            columns={["name", "role", "rating"]}
            initialItems={initial.testimonials as never[]}
          />
        ) : null}
        {active === "pages" ? <SettingsModule initial={initial.settings} section="pages" /> : null}
        {active === "nodes" ? (
          <CollectionModule
            title="Infrastruktur"
            description="Daftar node produksi beserta status dan spesifikasinya."
            resource="nodes"
            idField="id"
            fields={NODE_FIELDS}
            columns={["name", "region", "status", "uptime30d"]}
            initialItems={initial.nodes as never[]}
          />
        ) : null}
        {active === "regions" ? (
          <CollectionModule
            title="Lokasi Server"
            description="Region yang tersedia di Server Builder beserta pengali harganya."
            resource="regions"
            idField="id"
            fields={REGION_FIELDS}
            columns={["name", "city", "latencyMs", "priceMultiplier", "enabled"]}
            initialItems={initial.regions as never[]}
          />
        ) : null}
        {active === "incidents" ? (
          <CollectionModule
            title="Insiden & Maintenance"
            description="Catat gangguan dan pemeliharaan terjadwal yang tampil di halaman Status."
            resource="incidents"
            idField="id"
            fields={INCIDENT_FIELDS}
            columns={["title", "severity", "startedAt", "resolvedAt"]}
            initialItems={initial.incidents as never[]}
          />
        ) : null}
        {active === "announcements" ? (
          <CollectionModule
            title="Pengumuman"
            description="Banner yang tampil di bagian paling atas seluruh halaman publik."
            resource="announcements"
            idField="id"
            fields={ANNOUNCEMENT_FIELDS}
            columns={["body", "level", "active"]}
            initialItems={initial.announcements as never[]}
          />
        ) : null}
        {active === "theme" ? <SettingsModule initial={initial.settings} section="theme" /> : null}
        {active === "social" ? <SettingsModule initial={initial.settings} section="social" /> : null}
        {active === "maintenance" ? <SettingsModule initial={initial.settings} section="maintenance" /> : null}
        {active === "audit" ? <AuditModule initial={initial.audit} /> : null}
      </div>
    </div>
  );
}
