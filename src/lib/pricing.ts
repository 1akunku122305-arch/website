import type { Coupon, PriceFormula, Region } from "./types";

export const SOFTWARES = [
  { id: "paper", label: "Paper", kind: "server", ramFactor: 1, tpsFactor: 1.15, note: "Optimasi terbaik untuk plugin Bukkit/Spigot." },
  { id: "purpur", label: "Purpur", kind: "server", ramFactor: 1.02, tpsFactor: 1.14, note: "Paper + ratusan opsi gameplay tambahan." },
  { id: "fabric", label: "Fabric", kind: "server", ramFactor: 1.15, tpsFactor: 1.05, note: "Ringan, ekosistem mod modern." },
  { id: "forge", label: "Forge", kind: "server", ramFactor: 1.6, tpsFactor: 0.82, note: "Modpack besar, butuh RAM tinggi." },
  { id: "neoforge", label: "NeoForge", kind: "server", ramFactor: 1.5, tpsFactor: 0.88, note: "Penerus Forge dengan perbaikan performa." },
  { id: "vanilla", label: "Vanilla", kind: "server", ramFactor: 1.1, tpsFactor: 0.9, note: "Murni tanpa optimasi tambahan." },
  { id: "velocity", label: "Velocity", kind: "proxy", ramFactor: 0.5, tpsFactor: 1.2, note: "Proxy modern untuk network multi-server." },
  { id: "waterfall", label: "Waterfall", kind: "proxy", ramFactor: 0.6, tpsFactor: 1.1, note: "Proxy kompatibel plugin BungeeCord." },
] as const;

export type SoftwareId = (typeof SOFTWARES)[number]["id"];

export const MC_VERSIONS = ["1.21.4", "1.21.1", "1.20.6", "1.20.4", "1.19.4", "1.18.2", "1.16.5", "1.12.2", "1.8.9"];
export const JAVA_VERSIONS = ["Java 21", "Java 17", "Java 11", "Java 8"];
export const OPERATING_SYSTEMS = [
  "Ubuntu 24.04 LTS",
  "Ubuntu 22.04 LTS",
  "Debian 12",
  "AlmaLinux 9",
  "Rocky Linux 9",
  "Windows Server 2022",
];
export const PANELS = [
  { id: "none", label: "Tanpa Panel (SSH)" },
  { id: "pterodactyl", label: "Pterodactyl" },
  { id: "reviactyl", label: "Reviactyl" },
] as const;

export const LIMITS = {
  cpu: { min: 2, max: 32, step: 1 },
  ram: { min: 4, max: 256, step: 2 },
  ssd: { min: 20, max: 2000, step: 10 },
  nvme: { min: 0, max: 4000, step: 10 },
  hdd: { min: 0, max: 8000, step: 100 },
  bandwidth: { min: 1, max: 100, step: 1 },
  ports: { min: 0, max: 20, step: 1 },
};

// Hardware Tiers sesuai prompt
export const HARDWARE_TIERS = {
  p vnode: {
    name: "PVNode (Intel Xeon E5-2690 v4)",
    cpuModel: "Intel Xeon E5-2690 v4",
    basePrice: 45000,
    perCore: 8500,
    perGbRam: 3200,
    perGbSsd: 180,
  },
  vps: {
    name: "VPS (Intel Xeon E5-2690 v4)",
    cpuModel: "Intel Xeon E5-2690 v4",
    basePrice: 42000,
    perCore: 7800,
    perGbRam: 2900,
    perGbSsd: 160,
  },
  p vnode_pro: {
    name: "PVNode Pro (AMD EPYC Rome)",
    cpuModel: "AMD EPYC Rome 7702",
    basePrice: 95000,
    perCore: 12500,
    perGbRam: 4800,
    perGbSsd: 240,
  },
  p vnode_ultra: {
    name: "PVNode Ultra (AMD Ryzen 9 9950X)",
    cpuModel: "AMD Ryzen 9 9950X",
    basePrice: 145000,
    perCore: 16500,
    perGbRam: 6200,
    perGbSsd: 320,
  },
} as const;

export type HardwareTier = keyof typeof HARDWARE_TIERS;

export interface BuildConfig {
  cpu: number;
  ram: number;
  ssd: number;
  nvme: number;
  hdd: number;
  bandwidth: number;
  os: string;
  java: string;
  mcVersion: string;
  software: SoftwareId;
  panel: (typeof PANELS)[number]["id"];
  region: string;
  dedicatedIp: boolean;
  extraPorts: number;
  backup: boolean;
  prioritySupport: boolean;
  ddosAdvanced: boolean;
  billingCycle: "monthly" | "quarterly" | "yearly";
}

export const DEFAULT_CONFIG: BuildConfig = {
  cpu: 2,
  ram: 4,
  ssd: 20,
  nvme: 0,
  hdd: 0,
  bandwidth: 5,
  os: "Ubuntu 24.04 LTS",
  java: "Java 21",
  mcVersion: "1.21.4",
  software: "paper",
  panel: "pterodactyl",
  region: "id",
  dedicatedIp: false,
  extraPorts: 0,
  backup: true,
  prioritySupport: false,
  ddosAdvanced: false,
  billingCycle: "monthly",
};

export const CYCLES = {
  monthly: { label: "Bulanan", months: 1, discount: 0 },
  quarterly: { label: "3 Bulan", months: 3, discount: 0.05 },
  yearly: { label: "12 Bulan", months: 12, discount: 0.15 },
} as const;

function clampStep(value: number, { min, max, step }: { min: number; max: number; step: number }) {
  const v = Number.isFinite(value) ? value : min;
  const snapped = Math.round((v - min) / step) * step + min;
  return Math.min(max, Math.max(min, snapped));
}

export function normalizeConfig(input: Partial<BuildConfig>): BuildConfig {
  const cfg = { ...DEFAULT_CONFIG, ...input };
  return {
    ...cfg,
    cpu: clampStep(Number(cfg.cpu), LIMITS.cpu),
    ram: clampStep(Number(cfg.ram), LIMITS.ram),
    ssd: clampStep(Number(cfg.ssd), LIMITS.ssd),
    nvme: clampStep(Number(cfg.nvme), LIMITS.nvme),
    hdd: clampStep(Number(cfg.hdd), LIMITS.hdd),
    bandwidth: clampStep(Number(cfg.bandwidth), LIMITS.bandwidth),
    extraPorts: clampStep(Number(cfg.extraPorts), LIMITS.ports),
    software: (SOFTWARES.find((s) => s.id === cfg.software)?.id ?? "paper") as SoftwareId,
    panel: (PANELS.find((p) => p.id === cfg.panel)?.id ?? "pterodactyl") as BuildConfig["panel"],
    os: OPERATING_SYSTEMS.includes(cfg.os) ? cfg.os : OPERATING_SYSTEMS[0],
    java: JAVA_VERSIONS.includes(cfg.java) ? cfg.java : JAVA_VERSIONS[0],
    mcVersion: MC_VERSIONS.includes(cfg.mcVersion) ? cfg.mcVersion : MC_VERSIONS[0],
    billingCycle: cfg.billingCycle in CYCLES ? cfg.billingCycle : "monthly",
    dedicatedIp: Boolean(cfg.dedicatedIp),
    backup: Boolean(cfg.backup),
    prioritySupport: Boolean(cfg.prioritySupport),
    ddosAdvanced: Boolean(cfg.ddosAdvanced),
  };
}

export interface PriceBreakdown {
  label: string;
  amount: number;
}

export interface Quote {
  lines: PriceBreakdown[];
  monthly: number;
  cycleMonths: number;
  cycleDiscountPct: number;
  subtotal: number;
  couponDiscount: number;
  total: number;
  couponApplied: string | null;
  couponError: string | null;
  metrics: Metrics;
}

export interface Metrics {
  tps: number;
  players: number;
  cpuLoad: number;
  ramUsage: number;
  plugins: number;
  grade: string;
}

/** Deterministic capacity model used by both the UI and the order API. */
export function estimateMetrics(cfg: BuildConfig): Metrics {
  const sw = SOFTWARES.find((s) => s.id === cfg.software) ?? SOFTWARES[0];
  const isProxy = sw.kind === "proxy";

  const ramForPlayers = Math.max(0, cfg.ram - (isProxy ? 0.5 : 1.5)) / sw.ramFactor;
  const cpuCapacity = cfg.cpu * (isProxy ? 55 : 22) * sw.tpsFactor;
  const ramCapacity = ramForPlayers * (isProxy ? 45 : 9);
  const players = Math.max(4, Math.round(Math.min(cpuCapacity, ramCapacity)));

  const headroom = Math.min(cpuCapacity, ramCapacity) / Math.max(1, players);
  const tpsRaw = 20 * Math.min(1, 0.72 + 0.28 * headroom) * Math.min(1, sw.tpsFactor + 0.05);
  const tps = Math.round(Math.min(20, tpsRaw) * 10) / 10;

  const cpuLoad = Math.min(96, Math.round((players / Math.max(1, cpuCapacity)) * 78 + cfg.cpu * 0.6));
  const ramUsage = Math.min(94, Math.round((players / Math.max(1, ramCapacity)) * 74 + 12 * sw.ramFactor));
  const plugins = Math.max(5, Math.round(cfg.ram * 4.5 + cfg.cpu * 6 - (isProxy ? 20 : 0)));

  const score = cfg.cpu * 2 + cfg.ram + (cfg.nvme > 0 ? 6 : 0);
  const grade = score >= 60 ? "S" : score >= 40 ? "A" : score >= 22 ? "B" : "C";

  return { tps, players, cpuLoad, ramUsage, plugins, grade };
}

// Validasi kombinasi hardware vs software (sesuai prompt)
export function validateHardwareSoftware(cfg: BuildConfig): { valid: boolean; warning?: string } {
  const sw = SOFTWARES.find((s) => s.id === cfg.software);
  if (!sw) return { valid: true };

  // Forge / NeoForge membutuhkan RAM lebih tinggi
  if ((cfg.software === "forge" || cfg.software === "neoforge") && cfg.ram < 8) {
    return {
      valid: false,
      warning: "Forge & NeoForge membutuhkan minimal 8 GB RAM. Direkomendasikan 12 GB+ untuk modpack besar.",
    };
  }

  // Fabric butuh RAM lebih tinggi dari Vanilla
  if (cfg.software === "fabric" && cfg.ram < 6) {
    return {
      valid: false,
      warning: "Fabric direkomendasikan minimal 6 GB RAM untuk performa optimal.",
    };
  }

  // Proxy (Velocity/Waterfall) tidak butuh banyak RAM
  if ((cfg.software === "velocity" || cfg.software === "waterfall") && cfg.ram > 12) {
    return {
      valid: true,
      warning: "Proxy biasanya cukup dengan 4-8 GB RAM. RAM berlebih tidak meningkatkan performa signifikan.",
    };
  }

  return { valid: true };
}

export function computeQuote(
  cfg: BuildConfig,
  formula: PriceFormula,
  regions: Region[],
  coupon?: Coupon | null,
): Quote {
  const region = regions.find((r) => r.id === cfg.region) ?? regions[0];
  const mult = region?.priceMultiplier ?? 1;

  const lines: PriceBreakdown[] = [
    { label: "Base platform", amount: formula.base },
    { label: `${cfg.cpu} vCore CPU`, amount: cfg.cpu * formula.perCore },
    { label: `${cfg.ram} GB RAM DDR5`, amount: cfg.ram * formula.perGbRam },
  ];
  if (cfg.ssd) lines.push({ label: `${cfg.ssd} GB SSD`, amount: cfg.ssd * formula.perGbSsd });
  if (cfg.nvme) lines.push({ label: `${cfg.nvme} GB NVMe Gen4`, amount: cfg.nvme * formula.perGbNvme });
  if (cfg.hdd) lines.push({ label: `${cfg.hdd} GB HDD`, amount: cfg.hdd * formula.perGbHdd });
  lines.push({ label: `${cfg.bandwidth} TB bandwidth`, amount: cfg.bandwidth * formula.perTbBandwidth });
  if (cfg.panel === "pterodactyl") lines.push({ label: "Pterodactyl Panel", amount: formula.panelPterodactyl });
  if (cfg.panel === "reviactyl") lines.push({ label: "Reviactyl Panel", amount: formula.panelReviactyl });
  if (cfg.dedicatedIp) lines.push({ label: "Dedicated IPv4", amount: formula.dedicatedIp });
  if (cfg.extraPorts) lines.push({ label: `${cfg.extraPorts} port tambahan`, amount: cfg.extraPorts * formula.perExtraPort });
  if (cfg.backup) lines.push({ label: "Automatic backup", amount: formula.backup });
  if (cfg.prioritySupport) lines.push({ label: "Priority support", amount: formula.prioritySupport });
  if (cfg.ddosAdvanced) lines.push({ label: "Advanced DDoS filtering", amount: formula.ddosAdvanced });

  const raw = lines.reduce((sum, l) => sum + l.amount, 0);
  let monthly = Math.round((raw * mult) / 500) * 500;
  if (region && region.priceMultiplier !== 1) {
    lines.push({ label: `Region ${region.name} (×${region.priceMultiplier})`, amount: monthly - raw });
  }
  monthly = Math.max(45000, monthly);

  const cycle = CYCLES[cfg.billingCycle];
  const beforeCycle = monthly * cycle.months;
  const subtotal = Math.round(beforeCycle * (1 - cycle.discount));

  let couponDiscount = 0;
  let couponApplied: string | null = null;
  let couponError: string | null = null;

  if (coupon) {
    const expired = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() < Date.now() : false;
    const exhausted = coupon.maxUses > 0 && coupon.uses >= coupon.maxUses;
    if (!coupon.active) couponError = "Kupon tidak aktif.";
    else if (expired) couponError = "Kupon sudah kedaluwarsa.";
    else if (exhausted) couponError = "Kuota kupon sudah habis.";
    else {
      couponDiscount =
        coupon.type === "PERCENT"
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(subtotal, coupon.value);
      couponApplied = coupon.code;
    }
  }

  return {
    lines,
    monthly,
    cycleMonths: cycle.months,
    cycleDiscountPct: cycle.discount * 100,
    subtotal,
    couponDiscount,
    total: Math.max(0, subtotal - couponDiscount),
    couponApplied,
    couponError,
    metrics: estimateMetrics(cfg),
  };
}

export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
