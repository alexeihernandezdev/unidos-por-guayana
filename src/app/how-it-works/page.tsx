import type { Metadata } from "next";
import { HowItWorksDeck } from "@/modules/presentacion/ui/HowItWorksDeck";

export const metadata: Metadata = {
  title: "Cómo funciona | Unidos por la Guaira",
  description:
    "Recorrido por la plataforma que coordina y da transparencia a la ayuda humanitaria que sale desde La Guaira: actividades, aportes, solicitudes, acopio y transparencia pública.",
};

/**
 * Presentación "Cómo funciona" (feature 039). Deck a pantalla completa pensado
 * para exponer la plataforma ante prensa: una diapositiva por viewport, con
 * navegación por teclado/clic/gesto y mockups del sistema animados. La ruta es
 * pública (sin login) y el layout raíz la trata como inmersiva (tema petróleo,
 * sin navbar). Todo el motor vive en `HowItWorksDeck` (client).
 */
export default function HowItWorksPage() {
  return <HowItWorksDeck />;
}
