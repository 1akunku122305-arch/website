import type { ReactNode } from "react";
import { Particles } from "./particles";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b-[3px] border-black bg-[#0b0718] px-4 py-16 sm:px-6 sm:py-20">
      <Particles count={12} />
      <div className="relative mx-auto max-w-4xl text-center">
        <span className="chip text-[#c3ff3e]">{eyebrow}</span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#a99fc8]">{description}</p>
        ) : null}
        {children ? <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div> : null}
      </div>
    </section>
  );
}
