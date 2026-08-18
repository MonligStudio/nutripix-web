import SmoothScroll from "@/components/SmoothScroll";
import BootScreen from "@/components/BootScreen";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import FeatureCubes from "@/components/FeatureCubes";
import Platforms from "@/components/Platforms";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import CtaFooter from "@/components/CtaFooter";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <BootScreen />
      <Nav />
      <main>
        <Hero />
        {/* Akış: ne işe yarar (küpler) → nasıl kullanılır (el + telefon modeli) */}
        <FeatureCubes />
        <Journey />
        <Platforms />
        <Pricing />
        <Faq />
        <CtaFooter />
      </main>
    </>
  );
}
