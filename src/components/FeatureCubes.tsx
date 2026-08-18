"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { featureBlocks, featureGrids, featureProps } from "@/lib/content";
import { withBasePath } from "@/lib/paths";
import { BlockVisual } from "./BlockVisual";

/**
 * "Ne işe yarar" — pinlenmiş 3B blok sahnesi.
 *
 * Eski bento grid'in 3B karşılığı: her hücre bir bloğa dönüştü, hücrenin
 * oranını korudu (2×2 hücre küp, 2×1 hücre dikdörtgen prizma). Bloklar çok
 * uzaktan uçarak gelip grid düzenine oturur; yol boyunca dönerler. Yüzlerde
 * görsel yok, her yüz o özelliği anlatır. Aralarında Blender'da üretilmiş
 * 3B yiyecekler süzülür.
 *
 * Yerleşim çalışma anında hesaplanıyor (layout): sahne kenarlarında sabit bir
 * pay bırakılır, kalan alana grid ORTALANIR, hücre boyutu hem genişliğe hem
 * yüksekliğe sığacak şekilde seçilir ve bloklar arasında her zaman bir boşluk
 * kalır — yani hiçbir ekranda taşma ya da üst üste binme olmaz. Geniş ekranda
 * 5×3, dar/uzun ekranda 3×5 grid kullanılır; hangisi daha büyük hücre veriyorsa
 * o kazanır. Tüm hareket tek scroll ilerlemesinden türer (ScrollTrigger).
 */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Yazıların ve yiyecek boyutlarının kurgulandığı referans hücre. */
const DESIGN_CELL = 176;
/** Yüz içindeki her ölçü em — taban punto hücreyle orantılı küçülür.
    Alt sınır: dar ekranda yazı okunmaz hâle gelmesin. */
const FS_MIN = 0.72;
/** Bu hücrenin altında yüzler sadeleşir (bkz. .fc-compact / .fc-bare). */
const COMPACT_CELL = 132;
const BARE_CELL = 104;

export default function FeatureCubes() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(el);
    const blocks = q<HTMLElement>("[data-block]");
    const props = q<HTMLElement>("[data-prop]");
    const h1 = q<HTMLElement>(".fc-head-1")[0];
    const h2 = q<HTMLElement>(".fc-head-2")[0];
    const scene = q<HTMLElement>(".fc-scene")[0];

    /** Hesaplanan hedefler — sahne yüzdesi cinsinden (place bunları kullanır). */
    const blockTo = featureBlocks.map(() => ({ top: 50, left: 50 }));
    const propTo = featureProps.map(() => ({ top: 50, left: 50, on: false }));

    const layout = () => {
      if (!scene) return;
      const W = scene.clientWidth;
      const H = scene.clientHeight;
      if (!W || !H) return;

      // Ekran kenarlarında bırakılan pay
      const padX = W < 640 ? 16 : W < 1100 ? 28 : 44;
      const padB = W < 640 ? 22 : 36;
      // Üstte başlık için ayrılan yer (başlık gerçekten ölçülüyor)
      const headBottom = h2 ? h2.offsetTop + h2.offsetHeight : H * 0.14;
      const padT = headBottom + (W < 640 ? 14 : 26);

      // Geniş ekranda gridin iki yanında yiyeceklerin süzüldüğü bir şerit
      // bırakıyoruz; dar ekranda böyle bir lüks yok, tüm genişlik bloklara.
      const propLane = W >= 1200 ? 150 : 0;
      const availW = Math.max(120, W - (padX + propLane) * 2);
      const availH = Math.max(120, H - padT - padB);
      // Büyük ekranda grid küçük bir ada gibi kalmasın: üst sınır ekranla büyür
      const maxCell = clamp(W / 6.2, 160, 232);

      // İki grid varyantını dene, hangisi daha büyük hücre veriyorsa onu seç
      let best: { narrow: boolean; cols: number; rows: number; cell: number; gap: number } | null = null;
      for (const key of ["wide", "narrow"] as const) {
        const g = featureGrids[key];
        const k = key === "wide" ? 0.16 : 0.13; // hücreye oranla boşluk
        let cell = Math.min(
          availW / (g.cols + (g.cols - 1) * k),
          availH / (g.rows + (g.rows - 1) * k),
          maxCell,
        );
        let gap = cell * k;
        if (gap < 12) {
          // 3B derinlik ve hafif dönüşler için mutlak alt sınır
          gap = 12;
          cell = Math.min(
            (availW - (g.cols - 1) * gap) / g.cols,
            (availH - (g.rows - 1) * gap) / g.rows,
            maxCell,
          );
        }
        if (!best || cell > best.cell) {
          best = { narrow: key === "narrow", cols: g.cols, rows: g.rows, cell, gap };
        }
      }
      if (!best) return;

      const { narrow, cols, rows, cell, gap } = best;
      const step = cell + gap;
      const gw = cols * cell + (cols - 1) * gap;
      const gh = rows * cell + (rows - 1) * gap;
      const gx = (W - gw) / 2; // grid yatayda ortalı
      const gy = padT + (availH - gh) / 2; // dikeyde kalan alanın ortasında

      scene.style.setProperty("--cell", `${cell}px`);
      scene.style.setProperty("--fs", `${16 * clamp(cell / DESIGN_CELL, FS_MIN, 1.32)}px`);
      scene.classList.toggle("fc-compact", cell < COMPACT_CELL);
      scene.classList.toggle("fc-bare", cell < BARE_CELL);

      blocks.forEach((node) => {
        const i = Number(node.dataset.block);
        const b = featureBlocks[i];
        const at = narrow ? b.atSm : b.at;
        const w = b.w * cell + (b.w - 1) * gap;
        const h = b.h * cell + (b.h - 1) * gap;
        node.style.setProperty("--w", `${w}px`);
        node.style.setProperty("--h", `${h}px`);
        blockTo[i] = {
          left: ((gx + at.c * step + w / 2) / W) * 100,
          top: ((gy + at.r * step + h / 2) / H) * 100,
        };
      });

      props.forEach((node) => {
        const i = Number(node.dataset.prop);
        const p = featureProps[i];
        const at = narrow ? p.atSm : p.at;
        const size = Math.round(p.size * clamp(cell / DESIGN_CELL, 0.52, 1.32));
        const half = size / 2;
        const cx = clamp(gx + at.c * step + cell / 2, padX + half, W - padX - half);
        const cy = clamp(gy + at.r * step + cell / 2, padT + half, H - padB - half);
        // Gridin dışına konumlananlar için yer kalmadıysa (dar ekran) gizle;
        // boş hücreye oturanlar zaten gridin içinde duruyor.
        const overlaps =
          cx + half > gx - 8 && cx - half < gx + gw + 8 && cy + half > gy - 8 && cy - half < gy + gh + 8;
        const on = p.cell === true || !overlaps;
        propTo[i] = { left: (cx / W) * 100, top: (cy / H) * 100, on };
        node.style.width = `${size}px`;
        node.style.display = on ? "" : "none";
      });
    };

    const place = (t: number) => {
      // Bloklar: uzaktan gelip grid'e oturur (ilk yarı), sonra ikisi
      // kendi ekseninde yarım tur daha atar.
      const fly = clamp01(t * 2);
      const spin = t >= 0.5 ? (t - 0.5) * 2 : 0;

      blocks.forEach((node) => {
        const i = Number(node.dataset.block);
        const b = featureBlocks[i];
        const to = blockTo[i];
        const extra = b.spin ? lerp(0, b.spin, spin) : 0;
        node.style.top = `${lerp(b.from.top, to.top, fly)}%`;
        node.style.left = `${lerp(b.from.left, to.left, fly)}%`;
        node.style.transform =
          `translate3d(-50%, -50%, ${lerp(-30000, 0, fly)}px)` +
          ` rotateX(${lerp(b.from.rx, b.to.rx, fly)}deg)` +
          ` rotateY(${lerp(b.from.ry, b.to.ry, fly) + extra}deg)` +
          ` rotateZ(${lerp(b.from.rz, b.to.rz, fly)}deg)`;
      });

      // Yiyecekler bloklardan biraz sonra ve daha yavaş gelir (derinlik hissi)
      props.forEach((node) => {
        const i = Number(node.dataset.prop);
        const p = featureProps[i];
        const to = propTo[i];
        const pt = clamp01((t - 0.12) * 1.9);
        node.style.top = `${lerp(p.from.top, to.top, pt)}%`;
        node.style.left = `${lerp(p.from.left, to.left, pt)}%`;
        node.style.opacity = to.on ? `${clamp01((t - 0.14) * 6)}` : "0";
        node.style.transform =
          `translate3d(-50%, -50%, ${lerp(-14000, 0, pt)}px)` +
          ` rotate(${lerp(p.from.rot, p.rot, pt)}deg)`;
      });

      if (scene) scene.style.opacity = `${t >= 0.01 ? clamp01((t - 0.01) * 100) : 0}`;

      // İlk başlık büyüyüp bulanıklaşarak çıkar
      const p1 = clamp01(t * 2.5);
      if (h1) {
        h1.style.transform = `translate(-50%, -50%) scale(${lerp(1, 1.5, p1)})`;
        h1.style.filter = `blur(${lerp(0, 18, p1)}px)`;
        h1.style.opacity = `${1 - p1}`;
      }

      // İkincisi grid'in ÜSTÜNDE belirir — merkezi bloklara bırakıyoruz
      const p2 = clamp01((t - 0.4) * 7);
      if (h2) {
        h2.style.transform = `translate(-50%, 0) translateY(${lerp(18, 0, p2)}px)`;
        h2.style.opacity = `${p2}`;
      }
    };

    if (reduced) {
      const onResize = () => {
        layout();
        place(1);
      };
      onResize();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: () => `+=${window.innerHeight * 4}`,
      scrub: 1,
      pin: q<HTMLElement>(".fc-stage")[0],
      pinSpacing: true,
      invalidateOnRefresh: true,
      // Ekran/yön değişiminde grid yeniden hesaplanır
      onRefresh: (self) => {
        layout();
        place(self.progress);
      },
      onUpdate: (self) => place(self.progress),
    });
    layout();
    place(0);

    return () => st.kill();
  }, []);

  const faces = ["front", "back", "right", "left", "top", "bottom"] as const;

  return (
    <section id="ozellikler" ref={root} className="relative">
      <div className="fc-stage relative h-[100svh] w-full overflow-hidden">
        <div
          className="fc-scene pointer-events-none absolute inset-0 opacity-0"
          style={{ perspective: "10000px", transformStyle: "preserve-3d" }}
        >
          {featureBlocks.map((b, i) => (
            <div
              key={b.title}
              data-block={i}
              className="fc-box absolute"
              style={{ transformStyle: "preserve-3d" }}
            >
              {faces.map((f) => (
                <div key={f} className={`fc-f fc-f-${f}`}>
                  {f === "front" ? (
                    b.w > 1 && b.h === 1 ? (
                      /* geniş-alçak blok: mockup yanda, yazı solda */
                      <div className="flex h-full w-full items-stretch gap-[0.7em] p-[0.875em] text-left">
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-[0.5em]">
                            <span
                              className="text-[0.5625em] font-bold uppercase tracking-[0.16em]"
                              style={{ color: b.color }}
                            >
                              {b.tag}
                            </span>
                            <span
                              className="h-[0.375em] w-[0.375em] shrink-0 rounded-full"
                              style={{ background: b.color }}
                            />
                          </div>
                          <h3 className="mt-[0.4em] line-clamp-2 text-[0.8125em] font-bold leading-tight text-fg">
                            {b.title}
                          </h3>
                          <p className="fc-body-wide mt-[0.35em] line-clamp-2 text-[0.625em] leading-snug text-fg-2">
                            {b.body}
                          </p>
                          <div className="mt-auto flex items-baseline gap-[0.375em] border-t border-line pt-[0.375em]">
                            <span
                              className="font-display font-extrabold leading-none"
                              style={{ color: b.color, fontSize: "1.05em" }}
                            >
                              {b.stat}
                            </span>
                            <span className="text-[0.5em] leading-none text-fg-3">{b.statLabel}</span>
                          </div>
                        </div>
                        <div className="h-[64%] w-[32%] shrink-0 self-center">
                          <BlockVisual kind={b.visual} color={b.color} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full w-full flex-col p-[0.875em] text-left">
                        <div
                          className={`flex items-start justify-between gap-[0.5em] ${
                            b.w === 1 && b.h === 1 ? "fc-tagrow-sm" : ""
                          }`}
                        >
                          <span
                            className="text-[0.5625em] font-bold uppercase tracking-[0.16em]"
                            style={{ color: b.color }}
                          >
                            {b.tag}
                          </span>
                          <span
                            className="h-[0.375em] w-[0.375em] shrink-0 rounded-full"
                            style={{ background: b.color }}
                          />
                        </div>

                        {/* mini mockup — özelliği okumadan önce görsel anlatır */}
                        <div
                          className={
                            b.h > 1 ? "mt-[0.75em] h-[36%]" : "fc-visual-sm mt-[0.5em] h-[30%]"
                          }
                        >
                          <BlockVisual kind={b.visual} color={b.color} />
                        </div>

                        <div className="mt-auto">
                          <h3
                            className={`line-clamp-2 font-bold leading-tight text-fg ${
                              b.h > 1 ? "text-[1em]" : "text-[0.75em]"
                            }`}
                          >
                            {b.title}
                          </h3>
                          {b.h > 1 ? (
                            <p className="mt-[0.55em] line-clamp-3 text-[0.6875em] leading-snug text-fg-2">
                              {b.body}
                            </p>
                          ) : null}
                          <div className="mt-[0.5em] flex items-baseline gap-[0.375em] border-t border-line pt-[0.375em]">
                            <span
                              className="font-display font-extrabold leading-none"
                              style={{ color: b.color, fontSize: b.h > 1 ? "1.25em" : "0.875em" }}
                            >
                              {b.stat}
                            </span>
                            <span className="text-[0.5em] leading-none text-fg-3">{b.statLabel}</span>
                          </div>
                        </div>
                      </div>
                    )
                  ) : f === "back" || f === "right" ? (
                    <div
                      className="flex h-full w-full items-center justify-center px-[0.5em] text-center"
                      style={{ background: b.color }}
                    >
                      <span className="text-[0.6875em] font-bold leading-tight text-ink">{b.title}</span>
                    </div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-[0.25em] px-[0.625em] text-center">
                      <span
                        className="font-display text-[0.9375em] font-extrabold leading-none"
                        style={{ color: b.color }}
                      >
                        {b.stat}
                      </span>
                      <span className="line-clamp-3 text-[0.53125em] leading-snug text-fg-2">
                        {f === "left" ? b.body : b.statLabel}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {featureProps.map((p, i) => (
            <img
              key={p.src}
              data-prop={i}
              src={withBasePath(p.src)}
              alt=""
              className="fc-prop absolute opacity-0"
              style={{ width: `${p.size}px` }}
            />
          ))}
        </div>

        {/* açılış başlığı */}
        <div
          className="fc-head-1 absolute left-1/2 top-1/2 w-[74%] max-w-[900px] text-center lg:w-[62%]"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <h2 className="h-display text-[clamp(30px,5.6vw,64px)] leading-[1.02]">
            Tabağını çek, gerisini{" "}
            <span className="text-gradient-mint">NutriPix</span> hesaplasın.
          </h2>
        </div>

        {/* bloklar yerleşince üstte beliren başlık */}
        <div
          className="fc-head-2 absolute left-1/2 top-[4%] w-[88%] max-w-[680px] text-center opacity-0"
          style={{ transform: "translate(-50%, 0)" }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-mint/60" />
            <span className="eyebrow !text-mint">Ne işe yarar</span>
            <span className="h-px w-8 bg-mint/60" />
          </div>
          <h2 className="h-display mt-3 text-[clamp(22px,3.4vw,40px)] leading-[1.05]">
            Dokuz yetenek, <span className="text-gradient-mint">tek uygulama</span>
          </h2>
          <p className="mx-auto mt-2.5 max-w-[52ch] text-[13px] leading-relaxed text-fg-2 lg:text-[15px]">
            Fotoğraftan barkoda dört giriş yolu, otomatik kalori ve makro hesabı,
            su ve kilo takibi, iki dil.
          </p>
        </div>
      </div>
    </section>
  );
}
