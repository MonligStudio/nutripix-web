"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { spotlight, type SpotBeat } from "@/lib/content";
import { withBasePath } from "@/lib/paths";
import { PhoneFrame } from "./ui/PhoneFrame";
import SectionHead from "./SectionHead";

/**
 * "Ne işe yarar" — kalın çizgili özellik şeridi.
 *
 * Bölümün arkasında tek parça bir hat var; scroll ilerledikçe çiziliyor
 * (strokeDashoffset scrub). Kartlar ve telefonlar bu hattın üstüne dönüşümlü
 * olarak sağa/sola oturuyor. Zemin bölüm boyunca siyah kalır — yeşil, hemen
 * ardından gelen manifesto bölümünde başlar.
 */

/* Bölüm boyu uzun olduğu için hat da uzun: viewBox yüksekliği bölümün
   yaklaşık yüksekliğine denk gelsin ki son duraklarda hat kesilmesin. */
const RIBBON =
  "M700 40C300 180 140 560 620 720C1180 900 1330 1320 760 1520C300 1700 130 2080 700 2240C1200 2400 1320 2820 740 3020C280 3180 150 3560 700 3720C1150 3860 1240 4060 700 4160";

export default function Spotlight() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const path = el.querySelector<SVGPathElement>(".spot-ribbon path");
    if (!path) return;

    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(path, { strokeDashoffset: 0 });
      return;
    }

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 65%",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
        refreshPriority: -1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const [opener, ...rest] = spotlight;
  const middle = rest.slice(0, 2);
  const closing = rest.slice(2);

  return (
    <section
      id="ozellikler"
      ref={root}
      data-color="ink"
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="spot-ribbon" aria-hidden="true">
        <svg viewBox="0 0 1400 4200" fill="none" preserveAspectRatio="xMidYMin meet">
          <path d={RIBBON} strokeWidth="150" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-10">
        <div>
          <SectionHead
            eyebrow="Ne işe yarar"
            title={
              <>
                Dört giriş yolu, <span className="text-accent">tek günlük</span>
              </>
            }
            body="Fotoğraf, yazı, barkod ya da elle giriş — hangisi o an hızlıysa onu kullan. Hepsi aynı günlüğe düşer."
          />

          <div className="mt-20 lg:mt-28">
            <Beat beat={opener} />
          </div>
        </div>

        <div className="mt-24 space-y-24 lg:mt-36 lg:space-y-36">
          {middle.map((beat) => (
            <Beat key={beat.id} beat={beat} />
          ))}
        </div>

        <div className="mt-24 space-y-24 lg:mt-36 lg:space-y-36">
          {closing.map((beat) => (
            <Beat key={beat.id} beat={beat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Beat({ beat }: { beat: SpotBeat }) {
  const phone = beat.screen ? (
    <div className="spot-phone" data-parallax="0.12">
      <PhoneFrame glow={false}>
        <img
          src={withBasePath(beat.screen)}
          alt={beat.alt ?? ""}
          width={786}
          height={1704}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      </PhoneFrame>
    </div>
  ) : null;

  if (beat.layout === "solo") {
    return (
      <div className="spot-row flex-col">
        {phone}
        <div data-reveal className="mt-10 max-w-[52ch] text-center">
          <span className="eyebrow !text-accent">{beat.tag}</span>
          <h3 className="h-display mt-4 text-[clamp(30px,4.4vw,64px)]">{beat.title}</h3>
          <p className="mt-4 text-[15.5px] leading-relaxed text-fg-2 lg:text-[17px]">{beat.body}</p>
          {beat.stat && (
            <p className="mt-6 flex items-baseline justify-center gap-2">
              <span className="font-display text-[36px] leading-none text-accent">{beat.stat}</span>
              <span className="text-[12.5px] text-fg-3">{beat.statLabel}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (beat.layout === "note") {
    return (
      <div className="spot-row">
        <div data-reveal className="spot-card w-full max-w-[820px] p-8 text-center lg:p-14">
          <span className="eyebrow !text-accent">{beat.tag}</span>
          <h3 className="h-display mt-4 text-[clamp(28px,3.8vw,56px)]">{beat.title}</h3>
          <p className="mx-auto mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-fg-2">
            {beat.body}
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
            {beat.chips?.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-line-2 px-4 py-2 text-[13px] text-fg-2"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const card = (
    <div data-reveal className="spot-card w-full max-w-[560px] p-8 lg:p-12">
      <span className="eyebrow !text-accent">{beat.tag}</span>
      <h3 className="h-display mt-4 text-[clamp(28px,3.6vw,54px)]">{beat.title}</h3>
      <p className="mt-4 text-[15.5px] leading-relaxed text-fg-2 lg:text-[16.5px]">{beat.body}</p>
      {beat.stat && (
        <div className="mt-8 flex items-baseline gap-2.5 border-t border-line pt-6">
          <span className="font-display text-[40px] leading-none text-accent">{beat.stat}</span>
          <span className="text-[12.5px] text-fg-3">{beat.statLabel}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="spot-row">
      {beat.layout === "right" ? (
        <>
          {phone}
          {card}
        </>
      ) : (
        <>
          {card}
          {phone}
        </>
      )}
    </div>
  );
}
