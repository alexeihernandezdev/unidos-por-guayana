import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ActividadNoPerteneceAlAdminError,
  ActividadNoEncontradaError,
} from "@/modules/actividades/application/errors";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { esEditable } from "@/modules/actividades/domain/maquinaEstados";
import { AvanzarEstadoBoton } from "@/modules/actividades/ui/AvanzarEstadoBoton";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { TipoBadge } from "@/modules/actividades/ui/TipoBadge";
import { etiquetaTipo } from "@/modules/actividades/ui/tipos";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { AportesTabla } from "@/modules/aportes/ui/AportesTabla";
import { ProgresoMetas } from "@/modules/aportes/ui/ProgresoMetas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerActividadServicio } from "@/shared/actividades";
import {
  listarAportesPorActividadServicio,
  progresoDeActividadServicio,
} from "@/shared/aportes";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { avanzarEstadoAction } from "../actions";
import {
  cancelarAporteAction,
  marcarRecibidoAction,
  revertirRecibidoAction,
} from "@/app/aportes/actions";

type Props = {
  params: Promise<{ id: string }>;
};

async function cargarActividad(id: string, adminId: string): Promise<Actividad> {
  try {
    return await obtenerActividadServicio(id, adminId);
  } catch (error) {
    if (
      error instanceof ActividadNoEncontradaError ||
      error instanceof ActividadNoPerteneceAlAdminError
    ) {
      notFound();
    }
    throw error;
  }
}

export default async function ActividadDetallePage({ params }: Props) {
  const sesion = await requireRol(Rol.ADMIN);

  const { id } = await params;
  const ayuda = await cargarActividad(id, sesion.id);
  const editable = esEditable(ayuda.estado);
  const [progreso, aportes] = await Promise.all([
    progresoDeActividadServicio(ayuda.id),
    listarAportesPorActividadServicio(ayuda.id),
  ]);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title={ayuda.titulo}
        backHref="/panel/actividades"
        backLabel="Volver a las actividades"
        actions={
          editable && (
            <Button asChild variant="outline">
              <Link href={`/panel/actividades/${ayuda.id}/editar`}>Editar</Link>
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <TipoBadge tipo={ayuda.tipo} />
          <EstadoBadge estado={ayuda.estado} />
        </div>
        <p className="text-sm text-muted-foreground">
          {etiquetaTipo(ayuda.tipo)} · Destino:{" "}
          <span className="text-foreground">{ayuda.sectorDestino}</span>
          {" · "}
          Fecha:{" "}
          <span className="numeric-tnum font-mono text-foreground">
            {formatearFecha(ayuda.fecha)}
          </span>
        </p>
        {ayuda.descripcion && (
          <p className="max-w-[65ch] text-sm text-foreground/80 [text-wrap:pretty]">
            {ayuda.descripcion}
          </p>
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
          La actividad avanza en un solo sentido, paso a paso, hasta su estado
          final. No se puede retroceder.
        </p>
        <AvanzarEstadoBoton
          actividadId={ayuda.id}
          tipo={ayuda.tipo}
          estado={ayuda.estado}
          avanzarAction={avanzarEstadoAction}
        />
      </section>
    </PanelPage>
  );
}
