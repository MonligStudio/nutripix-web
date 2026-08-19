import { AppleGlyph, PlayGlyph } from "./Icons";
import { site } from "@/lib/content";

/**
 * İndirme butonları. iOS ve Android birebir aynı: köşeli siyah kutu, krem yazı.
 * Zemin ve hover rengi (turuncu) bölüm temasından bağımsız sabittir; hangi
 * durakta olursan ol buton aynı görünür.
 */
function Badge({
  href,
  small,
  big,
  children,
}: {
  href: string;
  small: string;
  big: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group relative inline-flex min-w-0 items-center gap-3 overflow-hidden rounded-[7px] bg-btn px-4 py-3.5 text-btn-fg"
    >
      {/* hover: turuncu dolgu sol alt köşeden büyüyerek butonu kaplar */}
      <span className="pointer-events-none absolute inset-0 origin-bottom-left scale-0 bg-btn-hover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-100" />

      {/* Logo rengi bölüm temasından bağımsız: siyah butonun üstünde her zaman
          krem (Play logosu kendi marka renklerinde). */}
      <span className="relative shrink-0 text-btn-fg">{children}</span>
      <span className="relative flex flex-col leading-none">
        <span className="text-[9.5px] font-medium uppercase tracking-[0.14em] opacity-55">
          {small}
        </span>
        <span className="mt-1 whitespace-nowrap font-display text-[17px] tracking-[0.03em]">
          {big}
        </span>
      </span>
    </a>
  );
}

export function StoreBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`store-badges flex flex-nowrap items-center gap-2 ${className}`}>
      <Badge href={site.stores.ios} small="App Store" big="iOS İÇİN İNDİR">
        <AppleGlyph className="h-6 w-6" />
      </Badge>
      <Badge href={site.stores.android} small="Google Play" big="ANDROID İÇİN İNDİR">
        <PlayGlyph className="h-6 w-6" />
      </Badge>
    </div>
  );
}
