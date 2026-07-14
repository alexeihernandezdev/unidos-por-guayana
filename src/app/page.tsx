import type { Metadata } from "next";
import {
  ActiveShipmentsSection,
  HeroParallaxSection,
  RolesSection,
  SiteFooter,
  SmoothScroll,
} from "@/modules/landing/ui";

export const metadata: Metadata = {
  title: "Unidos por la Guaira | Coordina y da transparencia a la ayuda humanitaria",
  description:
    "Plataforma para organizar la ayuda humanitaria que sale desde La Guaira tras el terremoto del 24 de junio. Cada aporte queda registrado; cada envío se rastrea de origen a destino.",
};

/**
 * Landing v2 (parallax). El hero y la sección de roles son las únicas piezas
 * por ahora; el resto de secciones (envíos activos, cómo funciona, cifras…)
 * se irán reincorporando sobre esta base.
 *
 * `SmoothScroll` (Lenis en modo root) no envuelve en ningún div: el flex de
 * <body> y el `flex-1` de <main> se conservan, y los children siguen siendo
 * server components. El hero vive recortado (overflow-hidden): al hacer
 * scroll, RolesSection pasa por encima de la figura y la corta en el borde,
 * como en la referencia TRK.9.
 */
export default function Home() {
  return (
    <SmoothScroll>
      <main className="flex-1">
        <HeroParallaxSection />
        <RolesSection />
        <ActiveShipmentsSection />
      </main>
      <SiteFooter />
    </SmoothScroll>
  );
}
