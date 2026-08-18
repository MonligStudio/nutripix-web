import { AppleGlyph, PlayGlyph } from "./Icons";
import { site } from "@/lib/content";

function Badge({
  href,
  small,
  big,
  children,
  primary = false,
}: {
  href: string;
  small: string;
  big: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={[
        "group relative inline-flex min-w-0 items-center gap-3 rounded-2xl px-3.5 py-3.5 transition-all duration-300",
        primary
          ? "bg-fg text-ink hover:bg-white"
          : "border border-line-2 bg-ink-2/70 text-fg hover:border-mint/45 hover:bg-ink-3",
      ].join(" ")}
    >
      <span className="shrink-0">{children}</span>
      <span className="flex flex-col leading-none">
        <span className="text-[9.5px] font-medium uppercase tracking-[0.11em] opacity-60">
          {small}
        </span>
        <span
          className="mt-1 whitespace-nowrap text-[13.5px] font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {big}
        </span>
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-mint/0 transition-all duration-300 group-hover:ring-1 group-hover:ring-mint/20" />
    </a>
  );
}

export function StoreBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`store-badges flex flex-nowrap items-center gap-2 ${className}`}>
      <Badge href={site.stores.ios} small="App Store" big="iOS için indir" primary>
        <AppleGlyph className="h-6 w-6" />
      </Badge>
      <Badge href={site.stores.android} small="Google Play" big="Android için indir">
        <PlayGlyph className="h-6 w-6" />
      </Badge>
    </div>
  );
}
