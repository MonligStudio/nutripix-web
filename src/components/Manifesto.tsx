import { heroStats } from "@/lib/content";
import { withBasePath } from "@/lib/paths";

/**
 * Dev tipografi bandı: sayfanın ortasında üç kelimelik bir cümle, arkasında
 * parallax'la süzülen yiyecekler. Bölüm kendi rengini (zeytin yeşili) getirir,
 * yani hero'nun siyahından buraya geçerken tüm sayfa renk değiştirir.
 */

/** Yiyecekler yazı bandının dışında kalır: üstte eyebrow hizasında, altta
    paragraf/rakam hizasında. left/top bölüm yüzdesi, depth parallax miktarı,
    sm dar ekranda görünsün mü. */
const floaters = [
  { src: "/props/elma.webp", left: "8%", top: "6%", size: 116, rotate: -12, depth: 0.34, sm: true },
  { src: "/props/brokoli.webp", left: "90%", top: "9%", size: 124, rotate: 9, depth: 0.22, sm: false },
  { src: "/props/domates.webp", left: "92%", top: "84%", size: 104, rotate: -6, depth: 0.4, sm: true },
  { src: "/props/havuc.webp", left: "8%", top: "74%", size: 118, rotate: 14, depth: 0.18, sm: false },
  { src: "/props/uzum.webp", left: "80%", top: "88%", size: 92, rotate: -4, depth: 0.46, sm: false },
  { src: "/props/yumurta.webp", left: "18%", top: "90%", size: 84, rotate: 7, depth: 0.28, sm: false },
];

export default function Manifesto() {
  return (
    <section
      id="neden"
      data-color="olive"
      data-parallax-scope
      className="relative overflow-hidden py-28 lg:py-40"
    >
      {floaters.map((f) => (
        <img
          key={f.src}
          src={withBasePath(f.src)}
          alt=""
          aria-hidden="true"
          data-parallax={f.depth}
          className={`pointer-events-none absolute z-0 -translate-x-1/2 -translate-y-1/2 opacity-90 drop-shadow-[0_24px_40px_rgba(0,0,0,.35)] ${
            f.sm ? "" : "hidden lg:block"
          }`}
          style={{
            left: f.left,
            top: f.top,
            width: `clamp(64px, ${f.size / 12}vw, ${f.size}px)`,
            rotate: `${f.rotate}deg`,
          }}
          loading="lazy"
        />
      ))}

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 text-center lg:px-10">
        <div data-reveal className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-accent" />
          <span className="eyebrow !text-accent">Bir öğün, üç adım</span>
          <span className="h-px w-10 bg-accent" />
        </div>

        <h2 data-reveal data-reveal-delay="80" className="h-giant mt-8">
          <span data-fit className="block whitespace-nowrap">Tartıya gerek yok</span>
          <span data-fit className="text-outline block whitespace-nowrap">
            Sadece fotoğraf çek
          </span>
        </h2>

        <p
          data-reveal
          data-reveal-delay="200"
          className="mx-auto mt-10 max-w-[52ch] text-[16px] leading-relaxed text-fg-2 lg:text-[18px]"
        >
          Tartı yok, uzun liste yok, gram hesabı yok. Tabağının fotoğrafını çek;
          kalori ve makrolar günlüğüne kendiliğinden düşsün.
        </p>

        <dl className="mx-auto mt-14 grid max-w-[860px] grid-cols-1 gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-3">
          {heroStats.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              data-reveal-delay={`${120 + i * 90}`}
              className="bg-base/40 px-6 py-8 backdrop-blur-sm"
            >
              <dt className="font-display text-[clamp(38px,5vw,64px)] leading-none text-accent">
                {s.value}
              </dt>
              <dd className="mt-3 text-[13px] leading-snug text-fg-2">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
