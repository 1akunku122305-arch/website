import type { Metadata } from "next";
import { RegisterForm } from "@/components/site/register-form";

export const metadata: Metadata = {
  title: "Daftar Akun",
  description: "Buat akun pelanggan WangStore untuk mengakses portal.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6">
      <RegisterForm />
    </section>
  );
}
