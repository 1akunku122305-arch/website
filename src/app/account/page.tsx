import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read } from "@/lib/db";
import { siteUrl } from "@/lib/content";
import { PageHero } from "@/components/site/page-hero";
import { AccountPortal } from "@/components/site/account-portal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Akun Saya",
  description: "Riwayat pesanan, tiket dukungan, konfigurasi tersimpan, dan kontak cepat WangStore.",
  alternates: { canonical: siteUrl("/account") },
  robots: { index: false, follow: true },
};

export default async function AccountPage() {
  const session = await getSession();
  
  // Jika belum login, arahkan ke halaman login pelanggan
  if (!session) {
    redirect("/customer-login");
  }

  const db = await read();
  return (
    <>
      <PageHero
        eyebrow="Akun"
        title="Portal pelanggan WangStore"
        description="Pantau pesanan, tiket, dan konfigurasi tersimpan Anda di satu tempat."
      />
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <AccountPortal 
          whatsapp={db.settings.social.whatsapp} 
          discord={db.settings.social.discord}
          user={session}
        />
      </section>
    </>
  );
}
