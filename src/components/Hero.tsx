"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { bootPromise } from "@/lib/boot";
import { withBasePath } from "@/lib/paths";
import { PhoneFrame } from "./ui/PhoneFrame";
import { StoreBadges } from "./ui/StoreBadges";
import { Icons } from "./ui/Icons";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(el);
    let cancelled = false;
    let removeParallax: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const reveal = [
        ...q(".hero-brand-letter"),
        ...q(".hero-copy-in"),
        ...q(".hero-actions-in"),
        ...q(".hero-card"),
      ];

      if (reduced) {
        gsap.set([...reveal, ...q(".hero-phone")], {
          opacity: 1,
          clearProps: "transform",
        });
        return;
      }

      gsap.set(q(".hero-phone"), { opacity: 0 });
      gsap.set(q(".hero-brand-letter"), {
        opacity: 0,
        scaleY: 0.28,
        transformOrigin: "center top",
      });
      gsap.set(q(".hero-copy-in"), { opacity: 0, y: 18 });
      gsap.set(q(".hero-actions-in"), { opacity: 0, y: 18 });
      gsap.set(q(".hero-card"), { opacity: 0, y: 24, scale: 0.88 });
    }, el);

    if (!reduced) {
      bootPromise.then(() => {
        if (cancelled) return;

        ctx.add(() => {
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .to(q(".hero-phone"), { opacity: 1, duration: 0.28 }, 0)
            .to(
              q(".hero-brand-letter"),
              { opacity: 1, scaleY: 1, duration: 1.2, stagger: 0.045, ease: "expo.out" },
              0.18,
            )
            .to(
              q(".hero-card"),
              { opacity: 1, y: 0, scale: 1, duration: 0.86, stagger: 0.11, ease: "back.out(1.55)" },
              0.58,
            )
            .to(q(".hero-copy-in"), { opacity: 1, y: 0, duration: 0.78, stagger: 0.08 }, 0.7)
            .to(
              q(".hero-actions-in"),
              { opacity: 1, y: 0, duration: 0.72, stagger: 0.09 },
              0.78,
            );
        });
      });

      if (window.matchMedia("(min-width: 901px)").matches) {
        const scene = q<HTMLElement>(".hero-parallax")[0];
        const brand = q<HTMLElement>(".hero-brand-backdrop")[0];
        const brandLetters = q<HTMLElement>(".hero-brand-letter");
        const copy = q<HTMLElement>(".hero-copy-depth")[0];
        const actions = q<HTMLElement>(".hero-action-depth")[0];
        const stretchLetters = brandLetters.map((letter) =>
          gsap.quickTo(letter, "scaleY", { duration: 1.15, ease: "power3.out" }),
        );

        const resetLetters = () => {
          stretchLetters.forEach((stretch) => stretch(1));
        };

        const move = (event: PointerEvent) => {
          const bounds = el.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
          const brandBounds = brand.getBoundingClientRect();

          if (event.clientY >= brandBounds.top && event.clientY <= brandBounds.bottom) {
            brandLetters.forEach((letter, index) => {
              const letterPosition = (index / (brandLetters.length - 1)) * 2 - 1;
              const effect = x * letterPosition;
              stretchLetters[index](1 + effect * 0.38);
            });
          } else {
            resetLetters();
          }

          gsap.to(scene, {
            rotateY: x * 8,
            rotateX: -y * 6,
            x: x * 9,
            y: y * 5,
            duration: 2.15,
            ease: "power3.out",
            overwrite: "auto",
            transformPerspective: 1400,
          });
          gsap.to(copy, {
            x: x * -8,
            y: y * -5,
            rotateY: x * -2.2,
            duration: 1.2,
            ease: "power2.out",
            transformPerspective: 1200,
          });
          gsap.to(actions, {
            x: x * 6,
            y: y * 4,
            rotateY: x * 1.8,
            duration: 1.25,
            ease: "power2.out",
            transformPerspective: 1200,
          });
        };

        const reset = () => {
          resetLetters();
          gsap.to(scene, {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            duration: 1.9,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to([copy, actions], {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            duration: 1.2,
            ease: "power3.out",
          });
        };

        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", reset);
        removeParallax = () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", reset);
        };
      }
    }

    return () => {
      cancelled = true;
      removeParallax?.();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="top" className="hero-shell relative overflow-hidden">

      <h1 className="hero-brand-backdrop" aria-label="NutriPix">
        {"NUTRIPIX".split("").map((letter, index) => (
          <span key={`${letter}-${index}`} aria-hidden="true" className="hero-brand-slot">
            <span className="hero-brand-letter">{letter}</span>
          </span>
        ))}
      </h1>

      <div className="device-lock hero-device-lock">
        <div className="hero-parallax relative h-full w-full">
          <div className="hero-phone absolute inset-0">
            <PhoneFrame>
              <Image
                src={withBasePath("/screens/home.webp")}
                alt="NutriPix günlük beslenme takip ekranı"
                fill
                priority
                sizes="(max-width: 900px) 64vw, 330px"
                className="object-cover"
              />
            </PhoneFrame>
          </div>

          <div className="hero-card hero-card-meal">
            <div className="hero-card-surface">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint/15 text-mint">
                  <Icons.check className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-semibold text-fg">Öğün kaydedildi</span>
              </div>
              <p className="mt-2 text-[10.5px] text-fg-2">Izgara tavuk · Bulgur</p>
              <p className="mt-1 font-display text-[19px] font-bold text-coral">
                612 <span className="text-[10px] font-medium text-fg-3">kcal</span>
              </p>
            </div>
          </div>

          <div className="hero-card hero-card-macros">
            <div className="hero-card-surface">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-fg-3">Makrolar</p>
              <div className="mt-3 space-y-2.5">
                {[
                  { label: "Protein", value: "48 g", width: "74%", color: "var(--color-mint)" },
                  { label: "Karb.", value: "62 g", width: "57%", color: "var(--color-amber)" },
                  { label: "Yağ", value: "18 g", width: "36%", color: "var(--color-pink)" },
                ].map((macro) => (
                  <div key={macro.label}>
                    <div className="flex justify-between text-[9.5px] text-fg-2">
                      <span>{macro.label}</span><span className="text-fg">{macro.value}</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full" style={{ width: macro.width, background: macro.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-card hero-card-streak">
            <div className="hero-card-surface flex items-center gap-2.5 !px-3.5 !py-3">
              <span className="text-[18px]">🔥</span>
              <div>
                <p className="font-display text-[14px] font-bold leading-none text-gold">12 gün</p>
                <p className="mt-1 text-[9px] text-fg-3">kesintisiz seri</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-copy-block">
        <div className="hero-copy-depth">
          <p className="hero-copy-in font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-mint">
            Fotoğraf · Barkod · Metin
          </p>
          <p className="hero-copy-in mt-3 font-display text-[clamp(21px,2.2vw,31px)] font-semibold leading-[1.12] tracking-[-0.035em] text-fg">
            Bir öğün, birkaç saniye.
            <br />
            <span className="text-fg-2">Gerisi tek ekranda.</span>
          </p>
        </div>
      </div>

      <div className="hero-action-block">
        <div className="hero-action-depth">
          <div className="hero-actions-in">
            <StoreBadges className="hero-store-badges" />
          </div>

          <div className="hero-actions-in mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-fg-3">
            <span className="inline-flex items-center gap-1.5">
              <Icons.check className="h-3.5 w-3.5 text-mint" /> 7 gün ücretsiz
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icons.check className="h-3.5 w-3.5 text-mint" /> Kart gerekmez
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
