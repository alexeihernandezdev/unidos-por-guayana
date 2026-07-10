import Link from "next/link";
import { notFound } from "next/navigation";
import { AyudaNoEncontradaError } from "@/modules/ayudas/application/errors";
import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { esEditable } from "@/modules/ayudas/domain/maquinaEstados";
import { AvanzarEstadoBoton } from "@/modules/ayudas/ui/AvanzarEstadoBoton";
import { EstadoBadge } from "@/modules/ayudas/ui/EstadoBadge";
import { TipoBadge } from "@/modules/ayudas/ui/TipoBadge";
import { etiquetaTipo } from "@/modules/ayudas/ui/tipos";
import { formatearFecha } from "@/modules/ayudas/ui/fechas";
import { AportesTabla } from "@/modules/aportes/ui/AportesTabla";
import { ProgresoMetas } from "@/modules/aportes/ui/ProgresoMetas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerAyudaServicio } from "@/shared/ayudas";
import {
  listarAportesPorAyudaServicio,
  progresoDeAyudaServicio,
} from "@/shared/aportes";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { avanzarEstadoAction } from "../actions";
import {
  cancelarAporteAction,
  marcarRecibidoAction,
  revertirRecibidoAction,
} from "@/app/aportes/actions";

type Props = {
  params: Promise<{ id: string }>;
};

async function cargarAyuda(id: string): Promise<Ayuda> {
  try {
    return await obtenerAyudaServicio(id);
  } catch (error) {
    if (error instanceof AyudaNoEncontradaError) notFound();
    throw error;
  }
}

export default async function AyudaDetallePage({ params }: Props) {
  await requireRol(Rol.ADMIN);

  const { id } = await params;
  const ayuda = await cargarAyuda(id);
  const editable = esEditable(ayuda.estado);
  const [progreso, aportes] = await Promise.all([
    progresoDeAyudaServicio(ayuda.id),
    listarAportesPorAyudaServicio(ayuda.id),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {ayuda.titulo}
            </h1>
            <TipoBadge tipo={ayuda.tipo} />
            <EstadoBadge estado={ayuda.estado} />
          </div>
          <p className="text-sm text-muted-foreground">
            {etiquetaTipo(ayuda.tipo)} · Destino:{" "}
            <span className="text-foreground">{ayuda.sectorDestino}</span>
            {" · "}
            Fecha:{" "}
            <span className="numeric-tnum text-foreground">
              {formatearFecha(ayuda.fecha)}
            </span>
          </p>
          {ayuda.descripcion && (
            <p className="max-w-[65ch] text-sm text-foreground/80 [text-wrap:pretty]">
              {ayuda.descripcion}
            </p>
          )}
        </div>
        {editable && (
          <Button asChild variant="outline">
            <Link href={`/panel/ayudas/${ayuda.id}/editar`}>Editar</Link>
          </Button>
        )}
      </div>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Metas de recursos</h2>
        <ProgresoMetas progreso={progreso} />
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Aportes</h2>
        <AportesTabla
          aportes={aportes}
          marcarRecibidoAction={marcarRecibidoAction}
          revertirRecibidoAction={revertirRecibidoAction}
          cancelarAporteAction={cancelarAporteAction}
        />
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Estado de la actividad</h2>
        <p className="text-sm text-muted-foreground">
          La actividad avanza en un solo sentido: Recolectando, Listo, En tránsito,
          Entregado.
        </p>
        <AvanzarEstadoBoton
          ayudaId={ayuda.id}
          estado={ayuda.estado}
          avanzarAction={avanzarEstadoAction}
        />
      </section>

      <Link
        href="/panel/ayudas"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a las actividades
      </Link>
    </main>
  );
}
