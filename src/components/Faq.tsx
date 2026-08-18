import { faq } from "@/lib/content";
import SectionHead from "./SectionHead";

export default function Faq() {
  return (
    <section id="sss" className="relative py-24 lg:py-36">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead
            eyebrow="SSS"
            title={
              <>
                Merak edilenler,
                <br />
                <span className="text-gradient-mint">kısa cevaplar</span>
              </>
            }
            body="Aradığını bulamadıysan destek ekibine yaz; genelde aynı gün içinde dönüyoruz."
          />
          <a
            data-reveal
            data-reveal-delay="200"
            href="mailto:zentia.app@gmail.com"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-line-2 px-5 py-2.5 text-[13.5px] font-medium text-fg transition-colors hover:border-mint/45 hover:bg-ink-2"
          >
            zentia.app@gmail.com
          </a>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {faq.map((f, i) => (
            <details
              key={f.q}
              data-reveal
              data-reveal-delay={`${i * 60}`}
              className="group"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-[16px] font-semibold leading-snug text-fg transition-colors group-hover:text-mint lg:text-[18px]">
                  {f.q}
                </h3>
                <span className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg-2 transition-colors group-open:border-mint/50 group-open:text-mint">
                  <span className="absolute h-[1.5px] w-2.5 bg-current" />
                  <span className="absolute h-2.5 w-[1.5px] bg-current transition-transform duration-300 group-open:scale-y-0" />
                </span>
              </summary>
              <p className="max-w-[68ch] pb-7 text-[14px] leading-relaxed text-fg-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
