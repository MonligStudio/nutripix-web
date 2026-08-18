import type { FeatureBlock } from "@/lib/content";

/**
 * Blokların ön yüzündeki mini mockup'lar. Uygulamanın gerçek arayüz
 * öğelerinin küçültülmüş hâlleri — kullanıcı bloğa bakınca özelliğin ne
 * olduğunu okumadan önce görsel olarak anlıyor.
 */
export function BlockVisual({ kind, color }: { kind: FeatureBlock["visual"]; color: string }) {
  switch (kind) {
    case "ring":
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <circle cx="32" cy="32" r="25" fill="none" stroke="var(--color-line)" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="25" fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="157" strokeDashoffset="52"
            transform="rotate(-90 32 32)"
          />
          <text x="32" y="30" textAnchor="middle" className="fill-fg" style={{ fontSize: 13, fontWeight: 700 }}>
            612
          </text>
          <text x="32" y="41" textAnchor="middle" className="fill-fg-3" style={{ fontSize: 7 }}>
            kcal
          </text>
        </svg>
      );

    case "list":
      return (
        <div className="flex h-full w-full flex-col justify-center gap-[3px]">
          {[["Izgara tavuk", "70%"], ["Bulgur", "48%"], ["Yoğurt", "30%"]].map(([n, w]) => (
            <div key={n} className="flex items-center gap-1.5">
              <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
              <span className="truncate text-[7.5px] text-fg-2">{n}</span>
              <span className="ml-auto h-[3px] w-6 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full" style={{ width: w, background: color }} />
              </span>
            </div>
          ))}
        </div>
      );

    case "barcode":
      return (
        <div className="flex h-full w-full items-center justify-center gap-[2px]">
          {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2].map((w, i) => (
            <span
              key={i}
              className="block h-[62%] rounded-[1px]"
              style={{ width: w, background: i % 3 === 0 ? color : "var(--color-fg-2)" }}
            />
          ))}
        </div>
      );

    case "macros":
      return (
        <div className="flex h-full w-full flex-col justify-center gap-[5px]">
          {[["Protein", "74%", "var(--color-mint)"], ["Karb.", "57%", "var(--color-amber)"],
            ["Yağ", "36%", "var(--color-pink)"]].map(([n, w, c]) => (
            <div key={n}>
              <div className="flex justify-between text-[7px] text-fg-3">
                <span>{n}</span>
              </div>
              <span className="mt-[2px] block h-[4px] w-full overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full" style={{ width: w, background: c }} />
              </span>
            </div>
          ))}
        </div>
      );

    case "water":
      return (
        <div className="flex h-full w-full items-end justify-center gap-[3px]">
          {[1, 1, 1, 0.55, 0].map((fill, i) => (
            <span
              key={i}
              className="relative block w-[9px] overflow-hidden rounded-b-[3px] rounded-t-[2px] border border-line-2"
              style={{ height: "62%" }}
            >
              <span
                className="absolute inset-x-0 bottom-0 block"
                style={{ height: `${fill * 100}%`, background: color, opacity: 0.85 }}
              />
            </span>
          ))}
        </div>
      );

    case "chart":
      return (
        <svg viewBox="0 0 64 34" className="h-full w-full">
          <polyline
            points="2,26 12,22 22,24 32,18 42,14 52,11 62,7"
            fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          />
          {[[2, 26], [22, 24], [42, 14], [62, 7]].map(([x, y]) => (
            <circle key={`${x}`} cx={x} cy={y} r="2.2" fill={color} />
          ))}
        </svg>
      );

    case "streak":
      return (
        <div className="flex h-full w-full items-center justify-center gap-1.5">
          <span className="text-[22px] leading-none">🔥</span>
          <div className="flex flex-col">
            <span className="font-display text-[15px] font-extrabold leading-none" style={{ color }}>
              12
            </span>
            <span className="text-[7px] text-fg-3">gün</span>
          </div>
        </div>
      );

    case "bell":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1">
          <span className="text-[15px] leading-none">🔔</span>
          <div className="flex gap-1">
            {["08:30", "13:00", "19:30"].map((t) => (
              <span
                key={t}
                className="rounded-full px-1 py-[1px] text-[6.5px] font-medium"
                style={{ background: "var(--color-ink-3)", color: "var(--color-fg-2)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      );

    case "lang":
      return (
        <div className="flex h-full w-full items-center justify-center">
          <span className="flex overflow-hidden rounded-full border border-line-2 text-[8px] font-semibold">
            <span className="px-2 py-[3px] text-ink" style={{ background: color }}>TR</span>
            <span className="px-2 py-[3px] text-fg-2">EN</span>
          </span>
        </div>
      );

    default:
      return null;
  }
}
