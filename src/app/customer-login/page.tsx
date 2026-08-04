import type { Metadata } from "next";
import { CustomerLoginForm } from "@/components/site/customer-login-form";

export const metadata: Metadata = {
  title: "Login Portal Pelanggan",
  description: "Masuk ke portal pelanggan WangStore.",
  robots: { index: false, follow: true },
};

export default function CustomerLoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6">
      <CustomerLoginForm />
    </section>
  );
}
