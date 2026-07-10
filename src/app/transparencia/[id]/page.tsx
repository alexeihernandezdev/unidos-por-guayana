import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetalleEnvioPublico } from "@/modules/transparencia/ui";
import { obtenerDetallePublicoServicio } from "@/shared/transparencia";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detalle = await obtenerDetallePublicoServicio(id);
  if (!detalle) {
    return { title: "Actividad no encontrada | Unidos por la Guaira" };
  }
  return {
    title: `${detalle.titulo} | Transparencia`,
    description: `Progreso público hacia ${detalle.sectorDestino}. Metas confirmadas sin datos personales.`,
  };
}

export default async function TransparenciaDetallePage({ params }: Props) {
  const { id } = await params;
  const detalle = await obtenerDetallePublicoServicio(id);
  if (!detalle) notFound();

  return (
    <main className="flex-1 border-t border-border bg-background">
      <DetalleEnvioPublico detalle={detalle} />
    </main>
  );
}
