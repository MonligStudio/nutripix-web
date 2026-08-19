import SmoothScroll from "@/components/SmoothScroll";
import SectionColor from "@/components/SectionColor";
import BootScreen from "@/components/BootScreen";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Journey from "@/components/Journey";
import Spotlight from "@/components/Spotlight";
import Platforms from "@/components/Platforms";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import CtaFooter from "@/components/CtaFooter";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SectionColor />
      <BootScreen />
      <Nav />
      <main>
        {/* Zemin kural olarak siyah; özellik şeridi kendi içinde siyah →
            yeşil → turuncu durakları taşır, manifesto ve SSS yeşile döner,
            kapanış turuncudur. Her durak data-color ile işaretli. */}
        <Hero />
        {/* Akış: ne işe yarar (şerit) → neden (manifesto) → nasıl kullanılır */}
        <Spotlight />
        <Manifesto />
        <Journey />
        <Platforms />
        <Pricing />
        <Faq />
        <CtaFooter />
      </main>
    </>
  );
}
