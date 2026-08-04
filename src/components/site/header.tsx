"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrolled } from "@/lib/client-hooks";
import { ButtonLink } from "@/components/ui";

const NAV = [
  { href: "/about", label: "Tentang" },
  { href: "/infrastructure", label: "Infrastruktur" },
  { href: "/features", label: "Fitur" },
  { href: "/blog", label: "Blog" },
  { href: "/knowledge-base", label: "Knowledge Base" },
  { href: "/status", label: "Status" },
  { href: "/contact", label: "Kontak" },
];

export function Header({ logo, title }: { logo: string; title: string }) {
  const pathname = usePathname();
  const scrolled = useScrolled(14);

  // Storing the path alongside the flag closes the menu on navigation without
  // needing an effect that sets state.
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const open = menu.open && menu.path === pathname;
  const setOpen = (next: boolean | ((v: boolean) => boolean)) =>
    setMenu((prev) => {
      const current = prev.open && prev.path === pathname;
      return { open: typeof next === "function" ? next(current) : next, path: pathname };
    });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b-[3px] border-black py-2" : "py-4",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${title} beranda`}>
          <span className="relative grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-gradient-to-br from-[#d946ef] to-[#7c3aed] shadow-[4px_4px_0_0_#000]">
            {logo.endsWith(".png") || logo.endsWith(".jpg") ? (
              <Image src={logo} alt="" width={28} height={28} className="rounded-lg" />
            ) : (
              <Zap className="bolt h-6 w-6 text-[#c3ff3e]" strokeWidth={3} />
            )}
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl font-black tracking-tight">
            {title.replace("Store", "")}
            <span className="text-[#c084fc]">Store</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-bold transition-colors",
                  active ? "bg-[#241645] text-[#c3ff3e]" : "text-[#cdc3ea] hover:bg-[#1b1233] hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href="/login" variant="secondary" size="sm">
            Masuk
          </ButtonLink>
          <ButtonLink href="/builder" size="sm">
            Build Server
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-[#1b1233] shadow-[4px_4px_0_0_#000] lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="mx-4 mt-3 space-y-1 rounded-2xl border-[3px] border-black bg-[#120d22] p-3 shadow-[6px_6px_0_0_#000] sm:mx-6">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl px-4 py-3 text-sm font-bold text-[#cdc3ea] hover:bg-[#1b1233] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <ButtonLink href="/login" variant="secondary" size="sm">
                  Masuk
                </ButtonLink>
                <ButtonLink href="/builder" size="sm">
                  Build Server
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
