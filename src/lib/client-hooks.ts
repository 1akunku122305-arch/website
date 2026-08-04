"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * True only after hydration. Uses `useSyncExternalStore` so no state is set
 * inside an effect, which avoids cascading renders while still guaranteeing the
 * server and client render identically on the first pass.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** Reactive "page has scrolled past `threshold`" flag, SSR-safe. */
export function useScrolled(threshold = 14): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

/**
 * Reads a JSON value from localStorage once hydration has completed.
 * Returns `null` on the server and whenever the entry is missing or malformed.
 */
export function useStoredJson<T>(key: string): T | null {
  const mounted = useMounted();
  if (!mounted) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
