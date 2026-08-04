import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings, siteUrl } from "@/lib/content";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { read } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl("/")),
    title: { default: `${s.siteTitle} — ${s.tagline}`, template: `%s | ${s.siteTitle}` },
    description: s.description,
    applicationName: s.siteTitle,
    keywords: [
      "minecraft hosting",
      "vps indonesia",
      "dedicated server",
      "panel hosting",
      "pterodactyl",
      "game hosting",
      "wangstore",
    ],
    alternates: { canonical: siteUrl("/") },
    icons: { icon: s.favicon, shortcut: s.favicon, apple: s.mascot },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: siteUrl("/"),
      siteName: s.siteTitle,
      title: `${s.siteTitle} — ${s.tagline}`,
      description: s.description,
      images: [{ url: s.mascot, width: 1200, height: 630, alt: s.siteTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${s.siteTitle} — ${s.tagline}`,
      description: s.description,
      images: [s.mascot],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0718",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db = await read();
  const s = db.settings;
  const announcement = db.announcements.find((a) => a.active) ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.siteTitle,
    url: siteUrl("/"),
    logo: siteUrl(s.logo),
    slogan: s.tagline,
    description: s.description,
    email: s.contact.email,
    telephone: s.contact.phone,
    address: { "@type": "PostalAddress", streetAddress: s.contact.address, addressCountry: "ID" },
    sameAs: [s.social.discord, s.social.telegram, s.social.tiktok, s.social.github, s.social.instagram].filter(Boolean),
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border-[3px] focus:border-black focus:bg-[#c3ff3e] focus:px-4 focus:py-2 focus:font-black focus:text-black"
        >
          Lewati ke konten
        </a>
        {announcement ? <AnnouncementBar announcement={announcement} /> : null}
        <Header logo={s.logo} title={s.siteTitle} />
        <main id="main">{children}</main>
        <Footer settings={s} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
