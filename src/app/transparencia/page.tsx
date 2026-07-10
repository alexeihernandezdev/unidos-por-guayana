import type { Metadata } from "next";
import { ResumenTransparencia } from "@/modules/transparencia/ui";
import { obtenerResumenPublicoServicio } from "@/shared/transparencia";

export const metadata: Metadata = {
  title: "Tablero de transparencia | Unidos por la Guaira",
  description:
    "Consulta en abierto qué se recolectó, el progreso de cada actividad y el destino de la ayuda humanitaria coordinada desde La Guaira.",
};

export default async function TransparenciaPage() {
  const resumen = await obtenerResumenPublicoServicio();

  return (
    <main className="flex-1 border-t border-border bg-background">
      <ResumenTransparencia resumen={resumen} />
    </main>
  );
}
