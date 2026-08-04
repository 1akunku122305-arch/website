"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Gauge, Server } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { Particles } from "./particles";

const HIGHLIGHTS = [
  { icon: Gauge, label: "20 TPS stabil" },
  { icon: ShieldCheck, label: "Anti-DDoS L3/L4/L7" },
  { icon: Server, label: "NVMe Gen4 RAID-10" },
  { icon: Zap, label: "Aktif < 10 menit" },
];

export function Hero({
  title,
  subtitle,
  badge,
  mascot,
}: {
  title: string;
  subtitle: string;
  badge: string;
  mascot: string;
}) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
      <Particles count={22} />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="chip text-[#c3ff3e]">
            <Zap className="bolt h-3.5 w-3.5" strokeWidth={3} />
            {badge}
          </span>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {title.split(" ").map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.5 }}
                className={i === 2 ? "bg-gradient-to-r from-[#d946ef] to-[#a855f7] bg-clip-text text-transparent" : ""}
              >
                {word}{" "}
              </motion.span>
            ))}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#a99fc8] sm:text-lg">{subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/builder" size="lg" className="glow">
              Racik Server Sekarang
            </ButtonLink>
            <ButtonLink href="/infrastructure" size="lg" variant="secondary">
              Lihat Infrastruktur
            </ButtonLink>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="brut-sm flex items-center gap-2 bg-[#150f28] px-3 py-3 text-xs font-bold"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#c084fc]" strokeWidth={2.6} />
                {label}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="brut relative overflow-hidden bg-gradient-to-br from-[#2a1352] to-[#120d22] p-3 glow"
          >
            <Image
              src={mascot}
              alt="Maskot penyihir WangStore memegang petir neon"
              width={1400}
              height={768}
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="h-auto w-full rounded-2xl"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="brut-sm absolute -bottom-5 -left-3 bg-[#c3ff3e] px-4 py-3 text-black sm:-left-6"
          >
            <p className="text-[10px] font-black uppercase tracking-widest">Mulai dari</p>
            <p className="font-[family-name:var(--font-display)] text-xl font-black">Rp45.000/bln</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            className="brut-sm absolute -right-2 top-6 bg-[#120d22] px-4 py-3 sm:-right-5"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-[#a99fc8]">Uptime 30 hari</p>
            <p className="font-[family-name:var(--font-display)] text-xl font-black text-[#c3ff3e]">99,97%</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
