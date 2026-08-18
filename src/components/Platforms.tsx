import { PhoneFrame } from "./ui/PhoneFrame";
import { StoreBadges } from "./ui/StoreBadges";
import { AppleGlyph, PlayGlyph, Icons } from "./ui/Icons";
import SectionHead from "./SectionHead";
import { withBasePath } from "@/lib/paths";

const bullets = [
  {
    t: "Tek hesap, iki cihaz",
    d: "iPhone'da başladığın günü Android tabletinde bitir. Öğünler, hedefler ve kilo kayıtları senkronize.",
  },
  {
    t: "Ana ekran widget'ı",
    d: "Su takibini uygulamayı açmadan, doğrudan ana ekrandan yap.",
  },
  {
    t: "Yerel bildirimler",
    d: "Öğün saatlerinde hatırlatma; saatleri kendin belirle, dilediğinde kapat.",
  },
];

export default function Platforms() {
  return (
    <section id="platformlar" className="relative overflow-hidden py-24 lg:py-36">
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-5 lg:grid-cols-2 lg:gap-10 lg:px-10">
        {/* görsel */}
        <div data-reveal className="relative order-2 lg:order-1">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle, rgba(74,222,128,.16) 0%, transparent 68%)",
            }}
          />

          <div className="relative flex items-end justify-center gap-4 lg:gap-7">
            <div className="w-[38%] max-w-[210px] -rotate-6 lg:w-[42%]">
              <PhoneFrame glow={false}>
                <img
                  src={withBasePath("/screens/goals.webp")}
                  alt="NutriPix hedefler ekranı"
                  width={786}
                  height={1704}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </PhoneFrame>
              <div className="mt-5 flex items-center justify-center gap-2 text-fg-3">
                <PlayGlyph className="h-4 w-4" />
                <span className="text-[12px] font-medium">Android</span>
              </div>
            </div>

            <div className="w-[46%] max-w-[260px] rotate-3 lg:w-[50%]">
              <PhoneFrame glow={false}>
                <img
                  src={withBasePath("/screens/history.webp")}
                  alt="NutriPix geçmiş ekranı"
                  width={786}
                  height={1704}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </PhoneFrame>
              <div className="mt-5 flex items-center justify-center gap-2 text-fg-3">
                <AppleGlyph className="h-4 w-4" />
                <span className="text-[12px] font-medium">iOS</span>
              </div>
            </div>
          </div>
        </div>

        {/* metin */}
        <div className="order-1 lg:order-2">
          <SectionHead
            eyebrow="Platformlar"
            title={
              <>
                iPhone'da da, Android'de de{" "}
                <span className="text-gradient-mint">aynı deneyim</span>
              </>
            }
            body="NutriPix tek kod tabanından, iki platform için birebir aynı arayüzle geliştirildi. Cihaz değiştirdiğinde alışkanlığını yeniden öğrenmen gerekmez."
          />

          <ul className="mt-10 space-y-5">
            {bullets.map((b, i) => (
              <li
                key={b.t}
                data-reveal
                data-reveal-delay={`${80 + i * 90}`}
                className="flex gap-4"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint/12 text-mint">
                  <Icons.check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[15.5px] font-semibold text-fg">{b.t}</p>
                  <p className="mt-1 max-w-[48ch] text-[13.5px] leading-relaxed text-fg-2">
                    {b.d}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div data-reveal data-reveal-delay="360" className="mt-10">
            <StoreBadges />
          </div>
        </div>
      </div>
    </section>
  );
}
