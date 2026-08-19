import { faq } from "@/lib/content";
import SectionHead from "./SectionHead";
import { withBrands } from "./ui/brand";

export default function Faq() {
  return (
    <section id="sss" data-color="olive" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-10">
        <SectionHead
          eyebrow="SSS"
          title={
            <>
              Merak edilenler, <span className="text-accent">kısa cevaplar</span>
            </>
          }
          body="Aradığını bulamadıysan destek ekibine yaz; genelde aynı gün içinde dönüyoruz."
        />

        <div className="mx-auto mt-16 max-w-[900px] divide-y divide-line border-y border-line lg:mt-20">
          {faq.map((f, i) => (
            <details key={f.q} data-reveal data-reveal-delay={`${i * 60}`} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <h3 className="text-[22px] leading-none transition-colors group-hover:text-accent lg:text-[26px]">
                  {withBrands(f.q)}
                </h3>
                <span className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-2 text-fg-2 transition-colors group-open:border-accent/60 group-open:text-accent">
                  <span className="absolute h-[1.5px] w-2.5 bg-current" />
                  <span className="absolute h-2.5 w-[1.5px] bg-current transition-transform duration-300 group-open:scale-y-0" />
                </span>
              </summary>
              <p className="max-w-[68ch] pb-7 text-[14px] leading-relaxed text-fg-2">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            data-reveal
            href="mailto:zentia.app@gmail.com"
            className="inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-3 font-display text-[16px] uppercase tracking-[0.04em] text-fg transition-colors hover:border-accent hover:text-accent"
          >
            zentia.app@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
