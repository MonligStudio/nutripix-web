"use client";

import { useEffect, useState } from "react";
import { LogoLockup } from "./ui/Logo";
import { nav, site } from "@/lib/content";
import { Icons } from "./ui/Icons";

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        // Yalnızca çizgi geçişi yumuşasın: arka plan bölüm rengiyle aynı anda
        // değişmeli, transition-all olursa header zeminin gerisinde kalıyor.
        "fixed inset-x-0 top-0 z-[100] transition-[border-color] duration-300",
        solid ? "border-b border-line bg-base/80 backdrop-blur-xl" : "border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5 lg:px-10">
        <a href="#top" className="transition-opacity hover:opacity-80">
          <LogoLockup />
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-4 py-2 text-[13.5px] font-medium text-fg-2 transition-colors hover:bg-surface hover:text-fg"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.stores.ios}
            className="hidden items-center gap-2 rounded-full bg-leaf px-5 py-2 font-display text-[16px] uppercase tracking-[0.03em] text-black transition-colors hover:bg-accent sm:inline-flex"
          >
            Ücretsiz dene
            <Icons.arrow className="h-3.5 w-3.5" />
          </a>

          <button
            aria-label="Menü"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-fg transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-full bg-fg transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* mobil menü */}
      <div
        className={[
          "overflow-hidden border-t border-line bg-base/95 backdrop-blur-xl transition-all duration-400 lg:hidden",
          open ? "max-h-[420px]" : "max-h-0 border-transparent",
        ].join(" ")}
      >
        <nav className="flex flex-col px-5 py-3">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-3.5 text-[15px] text-fg-2 last:border-0"
            >
              {n.label}
            </a>
          ))}
          <a
            href={site.stores.ios}
            className="mt-3 mb-1 inline-flex items-center justify-center gap-2 rounded-full bg-leaf px-5 py-2.5 font-display text-[17px] uppercase tracking-[0.03em] text-black"
          >
            Ücretsiz dene
          </a>
        </nav>
      </div>
    </header>
  );
}
