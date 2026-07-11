import type { Metadata } from "next";
import { MediosDonacionPublicos } from "@/modules/donaciones/ui/MediosDonacionPublicos";
import { ResumenTransparencia } from "@/modules/transparencia/ui";
import { listarMediosPublicablesServicio } from "@/shared/donaciones";
import { obtenerResumenPublicoServicio } from "@/shared/transparencia";

export const metadata: Metadata = {
  title: "Tablero de transparencia | Unidos por la Guaira",
  description:
    "Consulta en abierto qué se recolectó, el progreso de cada actividad y el destino de la ayuda humanitaria coordinada desde La Guaira.",
};

export default async function TransparenciaPage() {
  const [resumen, mediosDonacion] = await Promise.all([
    obtenerResumenPublicoServicio(),
    listarMediosPublicablesServicio(),
  ]);

  return (
    <main className="flex-1 border-t border-border bg-background">
      <ResumenTransparencia resumen={resumen} />
      {mediosDonacion.length > 0 && (
        <div className="mx-auto w-full max-w-5xl px-6 pb-12 md:px-8">
          <MediosDonacionPublicos medios={mediosDonacion} />
        </div>
      )}
    </main>
  );
}
