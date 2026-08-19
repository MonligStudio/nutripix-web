import { footerLinks, site } from "@/lib/content";
import { withBasePath } from "@/lib/paths";
import { LogoMark, Wordmark } from "./ui/Logo";
import { StoreBadges } from "./ui/StoreBadges";
import { PhoneFrame } from "./ui/PhoneFrame";

export default function CtaFooter() {
  return (
    <>
      {/* ── kapanış çağrısı ── */}
      <section
        data-color="orange"
        data-parallax-scope
        className="relative overflow-hidden py-28 lg:py-40"
      >
        {/* yanda süzülen telefon — dar ekranda düşer */}
        <div
          data-parallax="0.3"
          className="pointer-events-none absolute right-[4%] top-1/2 hidden w-[210px] -translate-y-1/2 rotate-[-7deg] opacity-95 xl:block"
        >
          <PhoneFrame buttons={false} glow={false}>
            <img
              src={withBasePath("/screens/fab.webp")}
              alt=""
              width={786}
              height={1704}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </PhoneFrame>
        </div>

        <div className="relative mx-auto max-w-[1280px] px-5 text-center lg:px-10">
          <div data-reveal className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-accent" />
            <span className="eyebrow !text-accent">7 gün ücretsiz</span>
            <span className="h-px w-10 bg-accent" />
          </div>

          <h2 data-reveal data-reveal-delay="80" className="h-giant mt-8">
            <span data-fit className="block whitespace-nowrap">Bugün öğlen ne yedin?</span>
          </h2>

          <p
            data-reveal
            data-reveal-delay="160"
            className="mx-auto mt-10 max-w-[48ch] text-[16px] leading-relaxed text-fg-2 lg:text-[18px]"
          >
            NutriPix&apos;i indir, ilk öğününü 7 saniyede kaydet. Kart bilgisi istemeden,
            tek dokunuşla.
          </p>

          <div
            data-reveal
            data-reveal-delay="240"
            className="mt-10 flex justify-center"
          >
            <StoreBadges />
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer data-color="ink" className="bg-base">
        <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,0.9fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark className="h-8 w-8 text-leaf" />
                <Wordmark className="text-[24px]" />
              </div>
              <p className="mt-5 max-w-[36ch] text-[13px] leading-relaxed text-fg-3">
                Yapay zekâ destekli beslenme asistanı. Yemeğini çek, kalorisini bil,
                hedefine sadık kal.
              </p>
              <p className="mt-6 text-[11.5px] text-fg-3">Sürüm {site.version}</p>
            </div>

            <FooterCol title="Ürün" links={footerLinks.urun} />
            <FooterCol title="Yasal" links={footerLinks.yasal} />
            <FooterCol title="İletişim" links={footerLinks.iletisim} />
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-[12px] text-fg-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {site.name}. Tüm hakları saklıdır.
            </p>
            <p className="max-w-[62ch] leading-relaxed">
              NutriPix bir tıbbi cihaz değildir; sağladığı değerler tahminîdir ve tıbbi
              tavsiye yerine geçmez.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="eyebrow !text-fg-2">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={withBasePath(l.href)}
              className="text-[13.5px] text-fg-3 transition-colors hover:text-fg"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
