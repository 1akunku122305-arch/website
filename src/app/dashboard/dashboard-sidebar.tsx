'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Save, Ticket, Bell, User, BookOpen, MessageCircle, Server, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Pesanan', icon: Package },
  { href: '/dashboard/services', label: 'Layanan Saya', icon: Server },
  { href: '/dashboard/saved-configs', label: 'Konfigurasi Tersimpan', icon: Save },
  { href: '/dashboard/tickets', label: 'Tiket', icon: Ticket },
  { href: '/dashboard/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
];

export function DashboardSidebar({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <p className="font-semibold">{user.name}</p>
        <p className="break-all text-xs text-neutral-400">{user.email}</p>
      </div>
      <nav aria-label="Menu dashboard" className="mt-4 space-y-1">
        {LINKS.map((l) => {
          const active = l.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(l.href);
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
      <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900">
          <MessageCircle className="h-4 w-4" /> Discord
        </a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </aside>
  );
}
