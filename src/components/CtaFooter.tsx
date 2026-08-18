import { footerLinks, site } from "@/lib/content";
import { withBasePath } from "@/lib/paths";
import { LogoMark, Wordmark } from "./ui/Logo";
import { StoreBadges } from "./ui/StoreBadges";
import { PhoneFrame } from "./ui/PhoneFrame";

export default function CtaFooter() {
  return (
    <>
      {/* ── kapanış çağrısı ── */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 100%, rgba(74,222,128,.14) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-[1280px] px-5 lg:px-10">
          <div className="relative overflow-hidden rounded-[32px] border border-line bg-ink-2/70 px-7 py-14 lg:px-16 lg:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(70% 90% at 88% 50%, rgba(74,222,128,.10) 0%, transparent 68%)",
              }}
            />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h2 data-reveal className="h-display text-[clamp(32px,5.4vw,62px)]">
                  Bugün öğlen ne yediğini
                  <br />
                  <span className="text-gradient-mint">biliyor musun?</span>
                </h2>
                <p
                  data-reveal
                  data-reveal-delay="90"
                  className="mt-6 max-w-[52ch] text-[15.5px] leading-relaxed text-fg-2 lg:text-[17px]"
                >
                  NutriPix'i indir, ilk öğününü 7 saniyede kaydet. 7 gün ücretsiz, kart
                  bilgisi istemeden.
                </p>
                <div data-reveal data-reveal-delay="180" className="mt-9">
                  <StoreBadges />
                </div>
              </div>

              <div data-reveal data-reveal-delay="120" className="relative flex justify-center lg:justify-end">
                <div className="w-[190px] rotate-[-5deg] lg:w-[230px]">
                  <PhoneFrame buttons={false}>
                    <img
                      src={withBasePath("/screens/fab.webp")}
                      alt="NutriPix öğün ekleme menüsü"
                      width={786}
                      height={1704}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </PhoneFrame>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="bg-ink">
        <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,0.9fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark className="h-8 w-8 text-mint" />
                <Wordmark className="text-[19px]" />
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
