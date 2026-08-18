import { plans, site } from "@/lib/content";
import { Icons } from "./ui/Icons";
import SectionHead from "./SectionHead";

export default function Pricing() {
  return (
    <section id="fiyatlar" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-10">
        <SectionHead
          eyebrow="Fiyatlar"
          title={
            <>
              Önce dene, <span className="text-gradient-mint">sonra karar ver</span>
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
                  ? "border border-mint/35 bg-ink-2 mint-glow"
                  : "border border-line bg-ink-2/60",
              ].join(" ")}
            >
              {p.highlight && (
                <>
                  <div
                    className="pointer-events-none absolute inset-0 opacity-80"
                    style={{
                      background:
                        "radial-gradient(80% 50% at 50% 0%, rgba(74,222,128,.12) 0%, transparent 70%)",
                    }}
                  />
                  <span className="absolute right-6 top-7 rounded-full bg-mint px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-ink">
                    En popüler
                  </span>
                </>
              )}

              <div className="relative">
                <h3 className="text-[17px] font-semibold text-fg-2">{p.name}</h3>

                <div className="mt-5 flex items-end gap-1.5">
                  <span
                    className="text-[42px] font-extrabold leading-none tracking-[-0.04em] lg:text-[48px]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {p.price}
                  </span>
                  <span className="mb-1.5 text-[14px] text-fg-3">{p.period}</span>
                </div>

                <p className="mt-2.5 text-[12.5px] text-mint">{p.note}</p>

                <div className="my-7 hairline" />

                <ul className="space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[13.5px] leading-snug text-fg-2">
                      <Icons.check
                        className={`mt-[3px] h-3.5 w-3.5 shrink-0 ${p.highlight ? "text-mint" : "text-fg-3"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={site.stores.ios}
                className={[
                  "relative mt-9 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-bold transition-all",
                  p.highlight
                    ? "bg-mint text-ink hover:bg-mint-2"
                    : "border border-line-2 text-fg hover:border-mint/45 hover:bg-ink-3",
                ].join(" ")}
                style={{ fontFamily: "var(--font-display)" }}
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
