import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read } from "@/lib/db";
import { PageHero } from "@/components/site/page-hero";
import { ProfileForm } from "@/components/site/profile-form";

export const metadata: Metadata = {
  title: "Profil Saya",
  description: "Kelola informasi akun Anda",
  robots: { index: false, follow: true },
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/customer-login");

  const db = await read();
  const user = db.users.find(u => u.email === session.email);

  return (
    <>
      <PageHero
        eyebrow="Akun"
        title="Profil Saya"
        description="Kelola informasi pribadi dan keamanan akun Anda."
      />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <ProfileForm user={user} />
      </section>
    </>
  );
}
