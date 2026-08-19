"use client";

import { useState } from "react";
import { PhoneFrame } from "./ui/PhoneFrame";
import { AppleGlyph, PlayGlyph } from "./ui/Icons";
import SectionHead from "./SectionHead";
import { platforms, type PlatformKey } from "@/lib/content";
import { withBasePath } from "@/lib/paths";

/**
 * İki model yan yana durur. Birinin üzerine gelince (ya da dokununca) diğeri
 * grileşip geri çekilir, seçilen öne çıkar ve altındaki üç özellik o platformun
 * özellikleriyle değişir.
 */
export default function Platforms() {
  const [active, setActive] = useState<PlatformKey>("ios");
  const current = platforms[active];

  return (
    <section
      id="platformlar"
      data-color="ink"
      data-parallax-scope
      className="relative overflow-hidden py-24 lg:py-36"
    >
      <div className="mx-auto max-w-[1280px] px-5 lg:px-10">
        <SectionHead
          eyebrow="Platformlar"
          title={
            <>
              <span lang="en">iPhone</span>&apos;da da, <span lang="en">Android</span>&apos;de de{" "}
              <span className="text-accent">aynı deneyim</span>
            </>
          }
          body="Tek kod tabanından, iki platform için birebir aynı arayüz. Modelin üzerine gel; o platforma özel ayrıntıları aşağıda gör."
        />

        {/* ── modeller ── */}
        <div
          data-reveal
          className="mt-16 flex items-start justify-center gap-6 lg:mt-24 lg:gap-16"
          onMouseLeave={() => setActive("ios")}
        >
          {(Object.keys(platforms) as PlatformKey[]).map((key) => {
            const p = platforms[key];
            const on = active === key;

            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onMouseEnter={() => setActive(key)}
                onFocus={() => setActive(key)}
                onClick={() => setActive(key)}
                className={[
                  "group flex w-[clamp(150px,26vw,290px)] flex-col items-center text-center transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]",
                  on
                    ? "z-10 translate-y-0 opacity-100 grayscale-0"
                    : "z-0 translate-y-3 opacity-45 grayscale",
                ].join(" ")}
              >
                <span
                  className={[
                    "block w-full transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]",
                    on ? "scale-100" : "scale-[0.92]",
                  ].join(" ")}
                >
                  <PhoneFrame
                    glow={false}
                    buttons={key === "ios"}
                    camera={key === "ios" ? "island" : "punch"}
                  >
                    <img
                      src={withBasePath(p.screen)}
                      alt={p.alt}
                      width={786}
                      height={1704}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </PhoneFrame>
                </span>

                <span className="mt-6 flex items-center gap-2">
                  <span className={on ? "text-accent" : "text-fg-3"}>
                    {key === "ios" ? (
                      <AppleGlyph className="h-4 w-4" />
                    ) : (
                      <PlayGlyph className="h-4 w-4" />
                    )}
                  </span>
                  {/* Marka adı: Türkçe büyük harf kuralı "iOS"u "İOS" yapmasın. */}
                  <span lang="en" className="font-display text-[19px] uppercase tracking-[0.04em]">
                    {p.label}
                  </span>
                </span>
                <span className="mt-1.5 text-[11.5px] text-fg-3">{p.note}</span>
              </button>
            );
          })}
        </div>

        {/* ── seçili platformun özellikleri: yan yana, modellerin altında ── */}
        <div key={active} className="platform-features mt-16 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-3 lg:mt-20">
          {current.features.map((f) => (
            <div key={f.t} className="bg-base px-6 py-8 lg:px-8">
              <h3 className="text-[21px] leading-none">{f.t}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-fg-2">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
