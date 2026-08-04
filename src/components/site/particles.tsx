"use client";

import { useMemo } from "react";
import { useMounted } from "@/lib/client-hooks";

interface Dot {
  left: number;
  size: number;
  delay: number;
  duration: number;
}

/**
 * Deterministic hash-based pseudo-random in [0, 1).
 *
 * Using a pure function instead of Math.random keeps rendering side-effect free
 * and makes the particle field reproducible between renders.
 */
function noise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Decorative floating particles.
 *
 * Only rendered after hydration so the server and client markup match exactly.
 */
export function Particles({ count = 18 }: { count?: number }) {
  const mounted = useMounted();

  const dots = useMemo<Dot[]>(() => {
    if (!mounted) return [];
    return Array.from({ length: count }, (_, i) => ({
      left: noise(i + 1) * 100,
      size: 3 + noise(i + 41) * 7,
      delay: noise(i + 83) * 8,
      duration: 7 + noise(i + 127) * 9,
    }));
  }, [mounted, count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${d.left}%`,
            bottom: "-20px",
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
