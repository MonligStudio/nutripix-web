"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey } from "@/lib/content";
import { themes } from "@/lib/palette";
import { SCREEN_STYLE, STAGE } from "@/lib/stage";
import { withBasePath } from "@/lib/paths";
import { HandLayer } from "./Hand";

/* Bu bölüm her zaman siyah temada; ray renkleri oradan sabit alınır. */
const RAIL_ON = themes.ink.accent;
const RAIL_OFF = "#3a332a";

const N = journey.length;
const INTRO = 0.6;
const TAIL = 0.6;
const TOTAL = INTRO + (N - 1) + TAIL;

/** Ekran geçiş türüne göre giriş/çıkış değerleri */
function transition(kind: string) {
  switch (kind) {
    case "slide-left":
      return {
        from: { xPercent: 102, yPercent: 0, scale: 1, opacity: 1 },
        to: { xPercent: 0, opacity: 1 },
        out: { xPercent: -16, opacity: 0.15, scale: 0.99 },
      };
    case "slide-up":
      return {
        from: { yPercent: 26, xPercent: 0, scale: 1, opacity: 0 },
        to: { yPercent: 0, opacity: 1 },
        out: { scale: 0.985, opacity: 0.25, xPercent: 0 },
      };
    case "zoom":
      return {
        from: { scale: 1.07, opacity: 0, xPercent: 0, yPercent: 0 },
        to: { scale: 1, opacity: 1 },
        out: { scale: 0.97, opacity: 0 },
      };
    default:
      return {
        from: { opacity: 0, scale: 1, xPercent: 0, yPercent: 0 },
        to: { opacity: 1 },
        out: { opacity: 0 },
      };
  }
}

export default function Journey() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);
      const screens = q<HTMLElement>("[data-screen]");
      const copies = q<HTMLElement>("[data-copy]");
      const fills = q<HTMLElement>("[data-rail-fill]");
      const dots = q<HTMLElement>("[data-rail-dot]");
      const tilt = q(".stage-tilt");
      const handPress = q(".hand-press");

      /* başlangıç durumu */
      gsap.set(screens, { opacity: 0, xPercent: 0, yPercent: 0, scale: 1 });
      gsap.set(screens[0], { opacity: 1 });
      screens.forEach((s, i) => gsap.set(s, { zIndex: i + 1 }));
      gsap.set(copies, { opacity: 0, y: 34 });
      gsap.set(copies[0], { opacity: 1, y: 0 });
      gsap.set(fills, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(handPress, { opacity: 0 });

      if (reduced) {
        gsap.set(fills, { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      /* giriş: ilk ekran nefes alır */
      tl.to(fills[0], { scaleX: 1, duration: INTRO }, 0);
      tl.fromTo(
        tilt,
        { rotation: -1.6 },
        { rotation: 0, duration: INTRO, ease: "power1.out" },
        0,
      );

      for (let i = 1; i < N; i++) {
        const step = journey[i];
        const t0 = INTRO + (i - 1);
        const tr = transition(step.enter);

        /* 1 — baş parmak hafifçe basar, ekran değişince bırakır (ufak, tek
           kemikli hareket — bkz. Hand.tsx .hand-rest/.hand-press) */
        tl.to(handPress, { opacity: 1, duration: 0.14, ease: "power2.out" }, t0 + 0.3);
        tl.to(handPress, { opacity: 0, duration: 0.26, ease: "power2.in" }, t0 + 0.5);

        /* 2 — ekran değişir */
        tl.fromTo(
          screens[i],
          tr.from,
          { ...tr.to, duration: 0.38, ease: "power3.out" },
          t0 + 0.47,
        );
        tl.to(screens[i - 1], { ...tr.out, duration: 0.34, ease: "power2.in" }, t0 + 0.47);

        /* 3 — metin çapraz geçişle değişir */
        tl.to(copies[i - 1], { opacity: 0, y: -26, duration: 0.26 }, t0 + 0.22);
        tl.fromTo(
          copies[i],
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.34, ease: "power2.out" },
          t0 + 0.42,
        );

        /* 4 — sahne hafifçe eğilir */
        tl.to(
          tilt,
          {
            rotation: i % 2 === 0 ? 1.3 : -1.3,
            duration: 1,
            ease: "power1.inOut",
          },
          t0,
        );

        /* 5 — ilerleme rayı */
        tl.to(fills[i], { scaleX: 1, duration: 0.72 }, t0 + 0.18);
        tl.to(dots[i], { backgroundColor: RAIL_ON, duration: 0.2 }, t0 + 0.5);
        tl.to(dots[i - 1], { backgroundColor: RAIL_OFF, duration: 0.2 }, t0 + 0.5);
      }

      tl.to({}, { duration: TAIL });
    }, section);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="nasil"
      data-color="olive"
      className="relative"
      style={{ height: `${TOTAL * 96}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="journey-layout mx-auto flex h-full max-w-[1280px] flex-col items-center justify-center gap-4 px-5 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
          {/* ── metin ── */}
          <div className="journey-copy order-2 w-full lg:order-1 lg:flex-1">
            {/* Bölüm başlığı: adımlar değişse de sabit kalır, kullanıcı
                hangi bölümde olduğunu kaybetmesin. */}
            <div className="mb-5 lg:mb-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-accent/60" />
                <span className="eyebrow !text-accent">Nasıl kullanılır</span>
              </div>
              <h2 className="h-display mt-4 text-[clamp(26px,3.4vw,44px)]">
                Uygulamayı <span className="text-accent">adım adım</span> gez
              </h2>
            </div>

            <div className="journey-steps relative h-[36svh] min-h-[266px] lg:h-[350px]">
              {journey.map((s) => (
                <article
                  key={s.id}
                  data-copy
                  className="absolute inset-x-0 top-0 lg:top-6"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: s.accent, fontFamily: "var(--font-display)" }}
                    >
                      {s.index}
                    </span>
                    <span className="h-px w-6 bg-line-2" />
                    <span className="eyebrow !text-fg-2">{s.chapter}</span>
                  </div>

                  <h3 className="h-display mt-4 text-[clamp(30px,5.2vw,72px)] lg:mt-6">
                    {s.title}
                  </h3>

                  <p className="mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-fg-2 lg:mt-5 lg:text-[16.5px]">
                    {s.body}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-2 lg:mt-7">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="rounded-full border border-line bg-surface/80 px-3 py-1.5 text-[11px] text-fg-2 lg:px-3.5 lg:text-[12.5px]"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {/* ilerleme rayı */}
            <div className="mt-5 flex items-center gap-1.5 lg:mt-10 lg:gap-2">
              {journey.map((s, i) => (
                <div key={s.id} className="flex flex-1 items-center gap-1.5 lg:gap-2">
                  <span
                    data-rail-dot
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: i === 0 ? RAIL_ON : RAIL_OFF }}
                  />
                  <span className="relative h-px flex-1 overflow-hidden bg-line-2">
                    <span
                      data-rail-fill
                      className="absolute inset-0 block bg-accent"
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── sahne: el + telefon ── */}
          <div
            className="stage journey-stage relative order-1 h-[30svh] shrink-0 overflow-hidden min-[420px]:h-[34svh] sm:h-[42svh] lg:order-2 lg:h-[min(84svh,780px)] lg:overflow-visible"
            style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }}
          >
            <div
              className="absolute inset-0"
              style={{
                animation: "float-soft 7s ease-in-out infinite",
                perspective: "1500px", // dokunuş çökmesinin derinliği için
              }}
            >
              <div className="stage-tilt absolute inset-0">
                {/* el + telefon (tek statik fotoğraf) + üstüne binen canlı ekran */}
                <HandLayer>
                  {/* ekranın arkaya vuran parıltısı */}
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      ...SCREEN_STYLE,
                      background:
                        "radial-gradient(60% 46% at 50% 46%, color-mix(in oklab, var(--accent) 26%, transparent) 0%, transparent 72%)",
                      filter: "blur(28px)",
                      transform: "scale(1.35)",
                    }}
                  />

                  {/* canlı uygulama ekranı — statik fotoğraftaki telefon
                      ekranının tam üstüne, ölçümlenmiş SCREEN dikdörtgeninde */}
                  <div
                    className="absolute overflow-hidden bg-black"
                    style={{ ...SCREEN_STYLE, borderRadius: "10% / 5%" }}
                  >
                    {journey.map((s, i) => (
                      <img
                        key={s.id}
                        data-screen
                        src={withBasePath(s.screen)}
                        alt={`${s.chapter} ekranı`}
                        width={786}
                        height={1704}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading={i < 2 ? "eager" : "lazy"}
                      />
                    ))}

                    <span
                      className="pointer-events-none absolute inset-0 z-[70]"
                      style={{
                        background:
                          "linear-gradient(122deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.012) 26%, transparent 46%)",
                      }}
                    />
                  </div>
                </HandLayer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
