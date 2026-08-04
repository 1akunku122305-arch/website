import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <Compass className="h-14 w-14 text-[#c3ff3e]" strokeWidth={2.2} />
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-black">404</h1>
      <p className="mt-3 text-lg font-bold">Halaman ini tidak ditemukan.</p>
      <p className="mt-2 text-sm text-[#a99fc8]">
        Tautan mungkin sudah berubah. Coba mulai dari beranda, Server Builder, atau knowledge base kami.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Ke Beranda</ButtonLink>
        <ButtonLink href="/builder" variant="secondary">
          Server Builder
        </ButtonLink>
        <ButtonLink href="/knowledge-base" variant="ghost">
          Knowledge Base
        </ButtonLink>
      </div>
    </section>
  );
}
