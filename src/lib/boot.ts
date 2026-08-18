"use client";

let resolver: (() => void) | null = null;
let resolved = false;

/** Açılış animasyonu bittiğinde çözülen promise. Hero gibi bileşenler buna bağlanır. */
export const bootPromise: Promise<void> = new Promise<void>((res) => {
  resolver = res;
});

export function markBootDone() {
  if (resolved) return;
  resolved = true;
  resolver?.();
}

export function isBootDone() {
  return resolved;
}
