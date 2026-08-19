import Link from "next/link";
import { LogoLockup } from "./ui/Logo";
import { Icons } from "./ui/Icons";
import { site } from "@/lib/content";

export default function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base">
      <header className="border-b border-line">
        <div className="mx-auto flex h-[68px] max-w-[820px] items-center justify-between px-5">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <LogoLockup />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] text-fg-2 transition-colors hover:text-fg"
          >
            <span className="rotate-180">
              <Icons.arrow className="h-3.5 w-3.5" />
            </span>
            Ana sayfa
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-5 py-16 lg:py-24">
        <p className="eyebrow !text-accent">Yasal</p>
        <h1 className="h-display mt-4 text-[clamp(32px,6vw,52px)]">{title}</h1>
        <p className="mt-4 text-[12.5px] text-fg-3">Son güncelleme: {updated}</p>
        <p className="mt-8 text-[16px] leading-relaxed text-fg-2">{intro}</p>

        <div className="my-12 hairline" />

        <div className="legal space-y-12">{children}</div>

        <div className="mt-16 rounded-2xl border border-line bg-surface/60 p-6">
          <p className="text-[14px] text-fg-2">
            Bu metinle ilgili sorularınız için{" "}
            <a href={`mailto:${site.email}`} className="text-accent hover:underline">
              {site.email}
            </a>{" "}
            adresine yazabilirsiniz.
          </p>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[820px] flex-col gap-3 px-5 py-8 text-[12px] text-fg-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex gap-5">
            <Link href="/gizlilik" className="transition-colors hover:text-fg">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-sartlari" className="transition-colors hover:text-fg">
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Article({
  id,
  n,
  title,
  children,
}: {
  id?: string;
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="flex items-baseline gap-3 text-[20px] lg:text-[23px]">
        <span className="text-[14px] font-bold text-accent">{n}</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[14.5px] leading-relaxed text-fg-2">{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function Table({
  head,
  rows,
}: {
  head: [string, string];
  rows: [string, string][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[460px] border-collapse text-left text-[13.5px]">
        <thead>
          <tr className="bg-surface">
            {head.map((h) => (
              <th key={h} className="px-5 py-3.5 font-semibold text-fg">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-t border-line align-top">
              <td className="px-5 py-3.5 text-fg">{a}</td>
              <td className="px-5 py-3.5 text-fg-2">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
