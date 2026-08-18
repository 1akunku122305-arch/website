'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  LayoutDashboard, Package, Users, Ticket, BadgePercent, Boxes, Server, Shield, Newspaper,
  BookOpen, HelpCircle, MessageSquareQuote, FileText, Activity, Settings, ScrollText, LogOut, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';
import { hasPermission } from '@/lib/auth/rbac';

interface LinkDef {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: Parameters<typeof hasPermission>[1];
}

const ALL_LINKS: LinkDef[] = [
  { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard, permission: 'analytics:read' },
  { href: '/admin/orders', label: 'Pesanan', icon: Package, permission: 'orders:read' },
  { href: '/admin/customers', label: 'Pelanggan', icon: Users, permission: 'customers:read' },
  { href: '/admin/tickets', label: 'Tiket & Kontak', icon: Ticket, permission: 'tickets:read' },
  { href: '/admin/services', label: 'Layanan', icon: Server, permission: 'services:read' },
  { href: '/admin/vps', label: 'VPS Packages', icon: Boxes, permission: 'vps:read' },
  { href: '/admin/pricing', label: 'Formula Harga', icon: BadgePercent, permission: 'pricing:read' },
  { href: '/admin/coupons', label: 'Kupon & Promosi', icon: BadgePercent, permission: 'coupons:read' },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper, permission: 'cms:read' },
  { href: '/admin/knowledge', label: 'Knowledge Base', icon: BookOpen, permission: 'cms:read' },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle, permission: 'cms:read' },
  { href: '/admin/testimonials', label: 'Testimoni', icon: MessageSquareQuote, permission: 'cms:read' },
  { href: '/admin/cms', label: 'Halaman & Legal', icon: FileText, permission: 'cms:read' },
  { href: '/admin/status', label: 'Status & Maintenance', icon: Activity, permission: 'status:read' },
  { href: '/admin/analytics', label: 'Analitik', icon: BarChart3, permission: 'analytics:read' },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings, permission: 'settings:write' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText, permission: 'audit:read' },
];

export function AdminSidebar({ role, userName }: { role: Role; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = useMemo(
    () => ALL_LINKS.filter((l) => (l.permission ? hasPermission(role, l.permission) : true)),
    [role],
  );

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <p className="font-semibold">{userName}</p>
        <p className="text-xs capitalize text-neutral-400">Role: {role}</p>
      </div>
      <nav aria-label="Menu admin" className="mt-4 space-y-1">
        {links.map((l) => {
          const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                active
                  ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900',
              )}
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </aside>
  );
}
