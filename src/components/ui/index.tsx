import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "lime";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-[#d946ef] to-[#7c3aed] text-white hover:from-[#e879f9] hover:to-[#8b5cf6]",
  secondary: "bg-[#1b1233] text-[#f5f2ff] hover:bg-[#241645]",
  ghost: "bg-transparent text-[#f5f2ff] hover:bg-[#1b1233]",
  danger: "bg-[#f43f5e] text-white hover:bg-[#fb5c76]",
  lime: "bg-[#c3ff3e] text-black hover:bg-[#d3ff6e]",
};

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  className?: string;
  children: ReactNode;
}

function classes({ variant = "primary", size = "md", className }: BaseProps) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] border-black font-black uppercase tracking-wide shadow-[4px_4px_0_0_#000] transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0_#000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c3ff3e] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_0_#000] disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  ...rest
}: BaseProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={classes({ variant, size, className, children })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  children,
  href,
  ...rest
}: BaseProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={classes({ variant, size, className, children })} {...rest}>
      {children}
    </Link>
  );
}

export function Card({
  className,
  children,
  as: As = "div",
  ...rest
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "article" | "section" | "li";
} & Omit<ComponentProps<"div">, "className" | "children" | "ref">) {
  return (
    <As className={cn("brut glass p-6 sm:p-7", className)} {...(rest as Record<string, unknown>)}>
      {children}
    </As>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow ? <span className="chip text-[#c3ff3e]">{eyebrow}</span> : null}
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-[#a99fc8]">{description}</p> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "brand",
  className,
}: {
  children: ReactNode;
  tone?: "brand" | "lime" | "cyan" | "danger" | "muted";
  className?: string;
}) {
  const tones = {
    brand: "bg-[#a855f7] text-black",
    lime: "bg-[#c3ff3e] text-black",
    cyan: "bg-[#22d3ee] text-black",
    danger: "bg-[#f43f5e] text-white",
    muted: "bg-[#241645] text-[#cdc3ea]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-black px-3 py-1 text-[11px] font-black uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="label block">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-[#8d83ad]">{hint}</p> : null}
      {error ? <p className="text-xs font-bold text-[#fb7185]">{error}</p> : null}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="brut-sm bg-[#150f28] p-4">
      <p className="label">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-black text-[#f5f2ff]">{value}</p>
      {sub ? <p className="text-xs text-[#8d83ad]">{sub}</p> : null}
    </div>
  );
}

export function Meter({ label, value, tone = "brand" }: { label: string; value: number; tone?: "brand" | "lime" | "danger" }) {
  const colors = {
    brand: "from-[#d946ef] to-[#7c3aed]",
    lime: "from-[#c3ff3e] to-[#84cc16]",
    danger: "from-[#fb7185] to-[#f43f5e]",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-[#a99fc8]">{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-black bg-[#0f0b1d]">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-500", colors[tone])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 text-[15px] leading-relaxed text-[#cdc3ea] [&_a]:font-bold [&_a]:text-[#c3ff3e] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#a855f7] [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-[#241645] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[#c3ff3e] [&_h2]:mt-8 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#f5f2ff] [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-[#f5f2ff] [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border-[3px] [&_pre]:border-black [&_pre]:bg-[#0f0b1d] [&_pre]:p-4 [&_strong]:text-[#f5f2ff] [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#3a2a63] [&_td]:p-2 [&_th]:border [&_th]:border-[#3a2a63] [&_th]:bg-[#1b1233] [&_th]:p-2 [&_th]:text-left",
        className,
      )}
    >
      {children}
    </div>
  );
}
