import Link from 'next/link';
import { Server } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { getSiteSettings } from '@/lib/settings';
import { ThemeToggle } from './theme-toggle';

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/server-builder', label: 'Server Builder' },
  { href: '/features', label: 'Fitur' },
  { href: '/vps', label: 'VPS' },
  { href: '/blog', label: 'Blog' },
  { href: '/knowledge-base', label: 'Knowledge Base' },
  { href: '/status', label: 'Status' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Kontak' },
];

export async function Navbar() {
  const settings = await getSiteSettings();
  const session = await getSession().catch(() => null);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <a href="#main" className="skip-link">
        Lewati ke konten utama
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black">
            <Server className="h-5 w-5" />
          </span>
          <span className="text-lg">{settings.siteName}</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            {session ? (
              <Link href={session.role === 'customer' ? '/dashboard' : '/admin'} className="btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Masuk
              </Link>
            )}
          </div>
          <MobileNav session={session} />
        </div>
      </div>
    </header>
  );
}

function MobileNav({ session }: { session: Awaited<ReturnType<typeof getSession>> }) {
  return (
    <details className="group relative lg:hidden">
      <summary
        aria-label="Menu"
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <span className="sr-only">Buka menu</span>
        <MenuIcon />
      </summary>
      <nav
        aria-label="Navigasi mobile"
        className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
      >
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {l.label}
          </Link>
        ))}
        <div className="mt-1 border-t border-neutral-200 pt-2 dark:border-neutral-800">
          {session ? (
            <Link
              href={session.role === 'customer' ? '/dashboard' : '/admin'}
              className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
            >
              Masuk
            </Link>
          )}
        </div>
      </nav>
    </details>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
