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
        "fixed inset-x-0 top-0 z-[100] transition-all duration-500",
        solid ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "border-b border-transparent",
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
              className="rounded-full px-4 py-2 text-[13.5px] font-medium text-fg-2 transition-colors hover:bg-ink-2 hover:text-fg"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.stores.ios}
            className="hidden items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-[13.5px] font-bold text-ink transition-all hover:bg-mint-2 hover:shadow-[0_0_30px_-6px_rgba(74,222,128,.6)] sm:inline-flex"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ücretsiz dene
            <Icons.arrow className="h-3.5 w-3.5" />
          </a>

          <button
            aria-label="Menü"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ink-2 lg:hidden"
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
          "overflow-hidden border-t border-line bg-ink/95 backdrop-blur-xl transition-all duration-400 lg:hidden",
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
            className="mt-3 mb-1 inline-flex items-center justify-center gap-2 rounded-full bg-mint px-5 py-3 text-[14px] font-bold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ücretsiz dene
          </a>
        </nav>
      </div>
    </header>
  );
}
