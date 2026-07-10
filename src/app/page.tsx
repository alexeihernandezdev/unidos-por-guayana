import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ActiveShipmentsSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  NumbersSection,
  SiteFooter,
  TrustSection,
} from "@/modules/landing/ui";
import { getUsuarioActual } from "@/shared/auth";
import { destinoPostLogin } from "@/shared/shell";

export const metadata: Metadata = {
  title: "Unidos por la Guaira | Coordina y da transparencia a la ayuda humanitaria",
  description:
    "Plataforma para organizar la ayuda humanitaria que sale desde La Guaira tras el terremoto del 24 de junio. Cada aporte queda registrado; cada envío se rastrea de origen a destino.",
};

export default async function Home() {
  const usuario = await getUsuarioActual();
  if (usuario) {
    redirect(await destinoPostLogin(usuario.id));
  }

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
