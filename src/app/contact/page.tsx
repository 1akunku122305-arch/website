import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, Users } from "lucide-react";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi WangStore melalui WhatsApp, Discord, Telegram, email, atau kirim tiket dukungan. Tim kami aktif 24/7.",
  alternates: { canonical: siteUrl("/contact") },
  openGraph: { title: "Kontak WangStore", url: siteUrl("/contact") },
};

export default async function ContactPage() {
  const db = await read();
  const s = db.settings;

  const channels = [
    { icon: MessageCircle, label: "WhatsApp", value: s.contact.phone, href: `https://wa.me/${s.social.whatsapp}`, desc: "Respons tercepat, 24 jam." },
    { icon: Users, label: "Grup WhatsApp", value: "Komunitas WangStore", href: s.social.whatsappGroup, desc: "Diskusi antar operator server." },
    { icon: MessageCircle, label: "Discord", value: "discord.gg/wangstore", href: s.social.discord, desc: "Kanal dukungan dan pengumuman." },
    { icon: Send, label: "Telegram", value: "@wangstore", href: s.social.telegram, desc: "Alternatif untuk notifikasi cepat." },
    { icon: Mail, label: "Email", value: s.contact.email, href: `mailto:${s.contact.email}`, desc: "Untuk urusan penagihan dan legal." },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: siteUrl("/contact"),
    mainEntity: {
      "@type": "Organization",
      name: s.siteTitle,
      email: s.contact.email,
      telephone: s.contact.phone,
      address: { "@type": "PostalAddress", streetAddress: s.contact.address, addressCountry: "ID" },
    },
  };

  return (
    <>
      <PageHero
        eyebrow="Kontak"
        title="Bicara langsung dengan tim teknis"
        description={s.contact.hours}
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="brut-sm brut-hover flex items-start gap-4 bg-[#150f28] p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-black bg-gradient-to-br from-[#d946ef] to-[#7c3aed]">
                <c.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              </span>
              <span>
                <span className="block text-sm font-black">{c.label}</span>
                <span className="block text-sm text-[#c3ff3e]">{c.value}</span>
                <span className="mt-1 block text-xs text-[#8d83ad]">{c.desc}</span>
              </span>
            </a>
          ))}

          <Card>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#c084fc]" />
              <div>
                <p className="text-sm font-black">Kantor</p>
                <p className="mt-1 text-sm text-[#a99fc8]">{s.contact.address}</p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#c084fc]" />
              <div>
                <p className="text-sm font-black">Jam Layanan</p>
                <p className="mt-1 text-sm text-[#a99fc8]">{s.contact.hours}</p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#c084fc]" />
              <div>
                <p className="text-sm font-black">Telepon</p>
                <p className="mt-1 text-sm text-[#a99fc8]">{s.contact.phone}</p>
              </div>
            </div>
          </Card>
        </div>

        <ContactForm />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
