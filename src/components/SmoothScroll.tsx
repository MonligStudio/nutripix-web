"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __lenis?: Lenis;
    __gsap?: typeof gsap;
    __ST?: typeof ScrollTrigger;
  }
}

/**
 * Lenis + ScrollTrigger kurulumu ve global "reveal" yöneticisi.
 * Reveal, IntersectionObserver + scroll dinleyicisi ile çift güvenceli çalışır;
 * biri donsa bile içerik görünür hâle gelir.
 */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    window.__gsap = gsap;
    window.__ST = ScrollTrigger;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | undefined;
    let rafId = 0;

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.05,
        lerp: 0.11,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        smoothWheel: true,
      });
      window.__lenis = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    /* ── Reveal ── */
    const revealAll = () => {
      const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          const d = el.dataset.revealDelay;
          if (d) el.style.transitionDelay = `${d}ms`;
          el.classList.add("is-in");
        }
      });
    };

    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const el = e.target as HTMLElement;
              const d = el.dataset.revealDelay;
              if (d) el.style.transitionDelay = `${d}ms`;
              el.classList.add("is-in");
              io?.unobserve(el);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
      );
      document.querySelectorAll("[data-reveal]").forEach((el) => io?.observe(el));
    }

    revealAll();
    window.addEventListener("scroll", revealAll, { passive: true });
    window.addEventListener("resize", revealAll);
    lenis?.on("scroll", revealAll);
    const t = window.setTimeout(revealAll, 400);

    /* ── Anchor linkleri ── */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -10, duration: 1.4 });
      else target.scrollIntoView({ behavior: "smooth" });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", revealAll);
      window.removeEventListener("resize", revealAll);
      window.clearTimeout(t);
      io?.disconnect();
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
}
