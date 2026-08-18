"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { markBootDone } from "@/lib/boot";
import { withBasePath } from "@/lib/paths";
import { PhoneFrame } from "./ui/PhoneFrame";

const STATUS = ["Hazırlanıyor", "Arayüz kuruluyor", "Son dokunuşlar", "Hazır"];

/* PhoneFrame'in %15.5 / %7.15 dış radius'una birebir oturan tek parça hat.
   Tepe merkezinden başlar, saat yönünde bir tur atıp aynı noktada kapanır. */
const FRAME =
  "M150 1.4H253.5A45.1 45.1 0 0 1 298.6 46.5V172.3Q301.4 172.3 301.4 175.1V226.7Q301.4 229.5 298.6 229.5V603.5A45.1 45.1 0 0 1 253.5 648.6H46.5A45.1 45.1 0 0 1 1.4 603.5V247Q-1.4 247-1.4 244.2V209.5Q-1.4 206.7 1.4 206.7V193.1Q-1.4 193.1-1.4 190.3V155.6Q-1.4 152.8 1.4 152.8V132.6Q-1.4 132.6-1.4 129.8V113.3Q-1.4 110.5 1.4 110.5V46.5A45.1 45.1 0 0 1 46.5 1.4H150Z";

const MARK_CORNERS = [
  "M4 15V8.5A4.5 4.5 0 0 1 8.5 4H15",
  "M33 4h6.5A4.5 4.5 0 0 1 44 8.5V15",
  "M44 33v6.5a4.5 4.5 0 0 1-4.5 4.5H33",
  "M15 44H8.5A4.5 4.5 0 0 1 4 39.5V33",
];

const APPLE =
  "M24 19.4c-2.9-3.7-8.3-3.2-10.3 1.2-2 4.4-1 11.2 2.4 15.1 1.9 2.2 3.9 2.5 5.8 1.5 1.3-.6 2.9-.6 4.2 0 1.9 1 3.9.7 5.8-1.5 3.4-3.9 4.4-10.7 2.4-15.1-2-4.4-7.4-4.9-10.3-1.2Z";
const LEAF = "M24.5 18.9c.4-4.2 3.2-6.9 7-7.2.3 4.2-2.6 7-6.4 7.5";

export default function BootScreen() {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const percentage = useRef<HTMLSpanElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      markBootDone();
      setHidden(true);
      return;
    }

    html.classList.add("boot-lock");
    window.__lenis?.stop();
    window.scrollTo(0, 0);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      html.classList.remove("boot-lock");
      window.__lenis?.start();
      markBootDone();
      setHidden(true);
    };

    const failsafe = window.setTimeout(() => {
      timeline.current?.progress(1);
      finish();
    }, 10000);

    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const frame = q<SVGPathElement>(".boot-progress-path");
      const markPaths = q<SVGPathElement>(".boot-mark-draw");
      const progress = { value: 0 };
      let statusIndex = -1;

      frame.forEach((path) => path.setAttribute("stroke-dashoffset", "1"));
      markPaths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
      gsap.set(q(".boot-device"), { opacity: 0 });
      gsap.set(q(".boot-app"), { opacity: 0 });
      gsap.set(q(".boot-brand"), { opacity: 0, y: 10 });
      gsap.set(q(".boot-meta"), { opacity: 0, y: 8 });
      gsap.set(q(".boot-mark-corner"), {
        scale: 1.5,
        transformOrigin: "24px 24px",
      });
      gsap.set(q(".boot-pulse"), { opacity: 0, scale: 0.4 });

      const updateProgress = () => {
        const value = progress.value;
        const index = value < 28 ? 0 : value < 66 ? 1 : value < 99 ? 2 : 3;

        /* CSSPlugin, 0..1 arasındaki stroke değerlerini tam piksele yuvarlıyor.
           SVG attribute'u doğrudan güncelleyerek çizgiyi kesintisiz akıtıyoruz. */
        const dashOffset = String(1 - value / 100);
        frame.forEach((path) => path.setAttribute("stroke-dashoffset", dashOffset));
        if (percentage.current) percentage.current.textContent = String(Math.round(value));
        if (index !== statusIndex && status.current) {
          statusIndex = index;
          status.current.textContent = STATUS[index];
        }
      };

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: finish,
      });
      timeline.current = tl;

      tl.to(q(".boot-mark-corner"), { strokeDashoffset: 0, duration: 0.38, stagger: 0.045 }, 0.18)
        .to(
          q(".boot-mark-corner"),
          { scale: 1, duration: 0.62, stagger: 0.045, ease: "back.out(2.1)" },
          0.24,
        )
        .to(q(".boot-mark-apple"), { strokeDashoffset: 0, duration: 0.72 }, 0.66)
        .to(q(".boot-mark-leaf"), { strokeDashoffset: 0, duration: 0.3 }, 1.16)
        .fromTo(
          q(".boot-mark"),
          { scale: 0.96 },
          { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.55)" },
          1.34,
        )
        .fromTo(
          q(".boot-pulse"),
          { opacity: 0.7, scale: 0.45 },
          { opacity: 0, scale: 1.65, duration: 0.85 },
          1.34,
        )
        .to(q(".boot-brand"), { opacity: 1, y: 0, duration: 0.5 }, 1.43)
        .to(q(".boot-meta"), { opacity: 1, y: 0, duration: 0.42 }, 1.58)
        .to(
          progress,
          {
            value: 100,
            duration: 3.15,
            ease: "power1.inOut",
            onUpdate: updateProgress,
          },
          1.72,
        )
        .to(q(".boot-progress-path"), { filter: "drop-shadow(0 0 7px rgba(74,222,128,.9))", duration: 0.2 }, 4.78)
        .to(q(".boot-mark, .boot-brand, .boot-meta"), { opacity: 0, y: -8, duration: 0.3 }, 4.98)
        .to(q(".boot-device"), { opacity: 1, duration: 0.34 }, 5)
        .to(q(".boot-frame-art"), { opacity: 0, duration: 0.32 }, 5.04)
        .to(
          q(".boot-app"),
          { opacity: 1, duration: 0.58, ease: "power2.out" },
          5.16,
        )
        .call(markBootDone, [], 5.54)
        .to(el, { opacity: 0, duration: 0.78, ease: "power2.inOut" }, 5.58);

      const at = new URLSearchParams(window.location.search).get("bootAt");
      if (at !== null) {
        window.clearTimeout(failsafe);
        tl.pause(Math.max(0, Math.min(1, Number.parseFloat(at) || 0)) * tl.duration(), false);
      }
    }, el);

    return () => {
      window.clearTimeout(failsafe);
      html.classList.remove("boot-lock");
      ctx.revert();
    };
  }, []);

  if (hidden) return null;

  return (
    <div ref={root} className="boot-screen fixed inset-0 z-[999] overflow-hidden bg-ink">
      <div className="hero-light hero-light-left" />
      <div className="hero-light hero-light-right" />
      <div className="hero-grid" aria-hidden="true" />

      <div className="device-lock boot-device-lock">
        <div className="boot-device absolute inset-0">
          <PhoneFrame>
            <div className="boot-app absolute inset-0 overflow-hidden bg-black">
              <Image
                src={withBasePath("/screens/home.webp")}
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 64vw, 330px"
                className="object-cover"
              />
            </div>
          </PhoneFrame>
        </div>

        <svg
          viewBox="0 0 300 650"
          fill="none"
          preserveAspectRatio="none"
          className="boot-frame-art absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="boot-frame-gradient" x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#87edac" />
              <stop offset="0.48" stopColor="#4ade80" />
              <stop offset="1" stopColor="#238f5c" />
            </linearGradient>
          </defs>
          <path
            d={FRAME}
            className="boot-progress-path"
            pathLength={1}
            stroke="url(#boot-frame-gradient)"
            strokeWidth="2.8"
            strokeDasharray="1"
            strokeDashoffset="1"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="-translate-y-3 text-center">
            <div className="relative mx-auto w-fit">
              <span className="boot-pulse absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-mint/70" />
              <svg viewBox="0 0 48 48" fill="none" className="boot-mark h-[74px] w-[74px] text-mint drop-shadow-[0_0_22px_rgba(74,222,128,.36)]" aria-hidden="true">
                <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  {MARK_CORNERS.map((path) => (
                    <path key={path} d={path} pathLength={1} strokeDasharray="1" strokeDashoffset="1" className="boot-mark-corner boot-mark-draw" opacity=".74" />
                  ))}
                  <path d={APPLE} pathLength={1} strokeDasharray="1" strokeDashoffset="1" className="boot-mark-apple boot-mark-draw" />
                  <path d={LEAF} pathLength={1} strokeDasharray="1" strokeDashoffset="1" className="boot-mark-leaf boot-mark-draw" />
                </g>
              </svg>
            </div>

            <p className="boot-brand mt-5 font-display text-[27px] font-extrabold tracking-[-0.045em]">
              Nutri<span className="text-mint">Pix</span>
            </p>

            <div className="boot-meta mt-8">
              <p className="font-display text-[31px] font-bold leading-none tabular-nums">
                <span ref={percentage}>0</span><span className="ml-0.5 text-[15px] text-mint">%</span>
              </p>
              <p ref={status} aria-live="polite" className="mt-2 text-[10px] uppercase tracking-[0.19em] text-fg-3">
                {STATUS[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button type="button" onClick={() => timeline.current?.timeScale(5)} className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-fg-3 transition-colors hover:text-fg">
        Geç
      </button>
    </div>
  );
}
