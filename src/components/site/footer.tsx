import Link from "next/link";
import { Code2, MessageCircle, Send, Music2, Users, Mail, Phone, MapPin } from "lucide-react";
import type { Settings } from "@/lib/types";

const COLUMNS = [
  {
    title: "Produk",
    links: [
      { href: "/builder", label: "Server Builder" },
      { href: "/features", label: "Fitur" },
      { href: "/infrastructure", label: "Infrastruktur" },
      { href: "/why-wangstore", label: "Kenapa WangStore" },
    ],
  },
  {
    title: "Sumber Daya",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/knowledge-base", label: "Knowledge Base" },
      { href: "/faq", label: "FAQ" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { href: "/about", label: "Tentang" },
      { href: "/testimonials", label: "Testimoni" },
      { href: "/contact", label: "Kontak" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/refund", label: "Refund Policy" },
      { href: "/legal/sla", label: "SLA" },
      { href: "/legal/aup", label: "Acceptable Use" },
      { href: "/legal/cookie", label: "Cookie Policy" },
    ],
  },
];

export function Footer({ settings }: { settings: Settings }) {
  const s = settings.social;
  const socials = [
    { href: `https://wa.me/${s.whatsapp}`, label: "WhatsApp", icon: MessageCircle },
    { href: s.whatsappGroup, label: "Grup WhatsApp", icon: Users },
    { href: s.discord, label: "Discord", icon: MessageCircle },
    { href: s.telegram, label: "Telegram", icon: Send },
    { href: s.tiktok, label: "TikTok", icon: Music2 },
    { href: s.github, label: "GitHub", icon: Code2 },
  ].filter((x) => x.href);

  return (
    <footer className="mt-24 border-t-[3px] border-black bg-[#0b0718]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-black">
              Wang<span className="text-[#c084fc]">Store</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#a99fc8]">{settings.footerText}</p>
            <ul className="mt-5 space-y-2 text-sm text-[#a99fc8]">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#c084fc]" /> {settings.contact.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#c084fc]" /> {settings.contact.phone}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c084fc]" /> {settings.contact.address}
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border-[3px] border-black bg-[#1b1233] shadow-[3px_3px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:bg-[#2a1a4f]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="label">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[#cdc3ea] transition-colors hover:text-[#c3ff3e]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t-2 border-[#241645] pt-6 text-xs text-[#8d83ad] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.siteTitle}. Seluruh hak cipta dilindungi.
          </p>
          <p>{settings.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
