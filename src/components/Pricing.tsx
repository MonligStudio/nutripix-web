import { plans, site } from "@/lib/content";
import { Icons } from "./ui/Icons";
import SectionHead from "./SectionHead";

export default function Pricing() {
  return (
    <section id="fiyatlar" data-color="ink" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-10">
        <SectionHead
          eyebrow="Fiyatlar"
          title={
            <>
              Önce dene, <span className="text-accent">sonra karar ver</span>
            </>
          }
          body="7 gün boyunca kart bilgisi vermeden kullan. Devam etmek istersen aylık ya da yıllık planla Premium'a geç; istediğin an iptal et."
          align="center"
        />

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {plans.map((p, i) => (
            <article
              key={p.id}
              data-reveal
              data-reveal-delay={`${i * 110}`}
              className={[
                "relative flex flex-col overflow-hidden rounded-[26px] p-7 lg:p-8",
                p.highlight
                  ? "border border-accent/35 bg-surface accent-glow"
                  : "border border-line bg-surface/60",
              ].join(" ")}
            >
              {p.highlight && (
                <>
                  <div
                    className="pointer-events-none absolute inset-0 opacity-80"
                    style={{
                      background:
                        "radial-gradient(80% 50% at 50% 0%, color-mix(in oklab, var(--accent) 14%, transparent) 0%, transparent 70%)",
                    }}
                  />
                  <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 font-display text-[13px] uppercase tracking-[0.12em] text-base">
                    En popüler
                  </span>
                </>
              )}

              <div className="relative">
                <h3 className="text-[24px] leading-none text-fg-2">{p.name}</h3>

                <div className="mt-5 flex items-end gap-1.5">
                  <span className="font-display text-[54px] leading-none lg:text-[64px]">
                    {p.price}
                  </span>
                  <span className="mb-1.5 text-[14px] text-fg-3">{p.period}</span>
                </div>

                <p className="mt-2.5 text-[12.5px] text-accent">{p.note}</p>

                <div className="my-7 hairline" />

                <ul className="space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[13.5px] leading-snug text-fg-2">
                      <Icons.check
                        className={`mt-[3px] h-3.5 w-3.5 shrink-0 ${p.highlight ? "text-accent" : "text-fg-3"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={site.stores.ios}
                className={[
                  "relative mt-9 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-display text-[17px] uppercase tracking-[0.03em] transition-all",
                  p.highlight
                    ? "bg-accent text-base hover:bg-accent-2"
                    : "border border-line-2 text-fg hover:border-accent hover:text-accent",
                ].join(" ")}
              >
                {p.cta}
                <Icons.arrow className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>

        <p
          data-reveal
          className="mx-auto mt-8 max-w-[70ch] text-center text-[12px] leading-relaxed text-fg-3"
        >
          Abonelikler App Store ve Google Play üzerinden yönetilir. Dönem bitiminden 24 saat
          önce iptal edilmezse otomatik yenilenir. Fiyatlara KDV dahildir.
        </p>
      </div>
    </section>
  );
}
