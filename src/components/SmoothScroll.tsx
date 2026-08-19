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

    /* ── Kenardan kenara başlık ──
       data-fit taşıyan satır, kapsayıcısının içine tam oturacak punto ile
       ölçeklenir (referans: dev tek satırlık tipografi bantları). Ölçüm font
       yüklendikten sonra yapılır, yoksa yedek fontun genişliğiyle hesaplanır. */
    const fitLines = () => {
      document.querySelectorAll<HTMLElement>("[data-fit]").forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        const style = getComputedStyle(parent);
        const room =
          parent.clientWidth -
          parseFloat(style.paddingLeft || "0") -
          parseFloat(style.paddingRight || "0");
        if (room <= 0) return;

        // Blok (ya da flex) öğenin genişliği kapsayıcısına eşit olduğu için
        // ölçüm sırasında width: max-content veriliyor; böylece hem düz metin
        // hem de harflere bölünmüş flex satırı kendi doğal genişliğini bildirir.
        const width0 = el.style.width;
        el.style.width = "max-content";
        el.style.fontSize = "100px";
        const width = el.getBoundingClientRect().width;
        el.style.width = width0;
        if (!width) return;
        const max = Number(el.dataset.fitMax) || 300;
        // SCHABO'nun yan boşlukları yüzünden harflerin mürekkebi kutunun biraz
        // içinde kalıyor; data-fit-bleed onu telafi eder (hero markası için).
        const bleed = Number(el.dataset.fitBleed) || 1;
        el.style.fontSize = `${Math.max(34, Math.min((room / width) * 100 * bleed, max))}px`;
      });
    };

    /* ── Parallax ──
       data-parallax="0.2" → öğe, kapsayıcısı ekrandan geçerken viewport'un
       %20'si kadar ters yönde kayar. Kapsayıcı varsayılan olarak ebeveyn;
       daha geniş bir alan isteniyorsa data-parallax-scope ile işaretlenir. */
    const parallaxTweens: gsap.core.Tween[] = [];

    if (!reduced) {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax) || 0.15;
        const scope =
          (el.closest("[data-parallax-scope]") as HTMLElement | null) ?? el.parentElement ?? el;
        const travel = () => (amount * window.innerHeight) / 2;

        parallaxTweens.push(
          gsap.fromTo(
            el,
            { y: travel },
            {
              y: () => -travel(),
              ease: "none",
              scrollTrigger: {
                trigger: scope,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true,
                refreshPriority: -1,
              },
            },
          ),
        );
      });
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
    fitLines();
    document.fonts?.ready.then(() => {
      fitLines();
      ScrollTrigger.refresh();
    });
    window.addEventListener("scroll", revealAll, { passive: true });
    window.addEventListener("resize", revealAll);
    window.addEventListener("resize", fitLines);
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
      parallaxTweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", revealAll);
      window.removeEventListener("resize", revealAll);
      window.removeEventListener("resize", fitLines);
      window.clearTimeout(t);
      io?.disconnect();
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
}
