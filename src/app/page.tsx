import type { Metadata } from "next";
import {
  ActiveShipmentsSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  NumbersSection,
  SiteFooter,
  SiteHeader,
  TrustSection,
} from "@/modules/landing/ui";

export const metadata: Metadata = {
  title: "Unidos por Guayana | Coordina y da transparencia a la ayuda humanitaria",
  description:
    "Plataforma para organizar la ayuda humanitaria que sale desde Guayana tras el terremoto del 24 de junio. Cada aporte queda registrado; cada envío se rastrea de origen a destino.",
};

export default function Home() {
  return (
    <>
      <SiteHeader />
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
