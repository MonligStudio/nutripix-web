"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { defaultTheme, themes, type ThemeName } from "@/lib/palette";

/**
 * Bölüm renkleri.
 *
 * `data-color="ink"` gibi bir tema adı taşıyan her bölüm ekranın ortasına
 * geldiğinde kök değişkenler (--bg / --fg / --accent / --accent-2) o temaya
 * tweenlenir. Yukarı kaydırırken de aynı mantık işler: ScrollTrigger'ın
 * onToggle'ı iki yönde de tetiklenir, aktif olan bölüm rengi belirler.
 *
 * Tüm türetilmiş renkler (yüzey, çizgi, ikincil metin) globals.css'te bu dört
 * değişkenden color-mix ile hesaplandığı için başka hiçbir yeri güncellemek
 * gerekmiyor.
 */
export default function SectionColor() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = (name: ThemeName, instant: boolean) => {
      const theme = themes[name] ?? themes[defaultTheme];
      const vars = {
        "--bg": theme.bg,
        "--fg": theme.fg,
        "--accent": theme.accent,
        "--accent-2": theme.accent2,
        "--ribbon": theme.ribbon,
        backgroundColor: theme.bg,
      };
      if (instant) gsap.set(root, vars);
      else gsap.to(root, { ...vars, duration: 0.55, ease: "power2.out", overwrite: "auto" });
    };

    /* İlk kurulumda ScrollTrigger bölümleri yerleştirirken birkaç tetikleyici
       arka arkaya açılıp kapanıyor; o an tween başlatmak yanlış renkten
       geçiş yapılmasına yol açıyor. İlk yarım saniye renkler anında oturur. */
    const mounted = performance.now();
    const settled = () => performance.now() - mounted > 600;

    const sections = gsap.utils.toArray<HTMLElement>("[data-color]");
    if (!sections.length) return;

    apply((sections[0].dataset.color as ThemeName) ?? defaultTheme, true);

    const triggers = sections.map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        // İleride pinli bir bölüm eklenirse sayfa yüksekliği değişeceği için
        // renk durakları en son ölçülmeli (pin refreshPriority: 1 alır).
        refreshPriority: -1,
        onToggle: (self) => {
          if (!self.isActive) return;
          apply((section.dataset.color as ThemeName) ?? defaultTheme, reduced || !settled());
        },
      }),
    );

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return null;
}
