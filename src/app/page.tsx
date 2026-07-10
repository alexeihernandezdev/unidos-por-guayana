import type { Metadata } from "next";
import {
  ActiveShipmentsSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  NumbersSection,
  SiteFooter,
  TrustSection,
} from "@/modules/landing/ui";

export const metadata: Metadata = {
  title: "Unidos por la Guaira | Coordina y da transparencia a la ayuda humanitaria",
  description:
    "Plataforma para organizar la ayuda humanitaria que sale desde La Guaira tras el terremoto del 24 de junio. Cada aporte queda registrado; cada envío se rastrea de origen a destino.",
};

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <HeroSection />
        <ActiveShipmentsSection />
        <HowItWorksSection />
        <NumbersSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
