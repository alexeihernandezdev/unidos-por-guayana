import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, Pencil } from "lucide-react";
import {
  ActividadNoPerteneceAlAdminError,
  ActividadNoEncontradaError,
} from "@/modules/actividades/application/errors";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { esEditable } from "@/modules/actividades/domain/maquinaEstados";
import { AvanzarEstadoBoton } from "@/modules/actividades/ui/AvanzarEstadoBoton";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { TipoBadge } from "@/modules/actividades/ui/TipoBadge";
import { formatearFecha, formatearHora } from "@/modules/actividades/ui/fechas";
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
  const actividad = await cargarActividad(id, sesion.id);
  const editable = esEditable(actividad.estado);
  const [progreso, aportes] = await Promise.all([
    progresoDeActividadServicio(actividad.id),
    listarAportesPorActividadServicio(actividad.id),
  ]);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title={actividad.titulo}
        backHref="/panel/actividades"
        backLabel="Volver a las actividades"
        actions={
          editable && (
            <Button asChild variant="outline">
              <Link href={`/panel/actividades/${actividad.id}/editar`}>
                <Pencil strokeWidth={1.5} />
                Editar
              </Link>
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TipoBadge tipo={actividad.tipo} />
          <EstadoBadge estado={actividad.estado} />
        </div>
        {actividad.descripcion && (
          <p className="max-w-[65ch] text-sm leading-relaxed text-foreground/80 [text-wrap:pretty]">
            {actividad.descripcion}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Metas de recursos
            </h2>
            <ProgresoMetas progreso={progreso} />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Aportes</h2>
            <AportesTabla
              aportes={aportes}
              marcarRecibidoAction={marcarRecibidoAction}
              revertirRecibidoAction={revertirRecibidoAction}
              cancelarAporteAction={cancelarAporteAction}
            />
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Estado de la actividad
            </h2>
            <p className="text-xs text-muted-foreground [text-wrap:pretty]">
              Avanza en un solo sentido, paso a paso, hasta su estado final. No se
              puede retroceder.
            </p>
            <AvanzarEstadoBoton
              actividadId={actividad.id}
              tipo={actividad.tipo}
              estado={actividad.estado}
              avanzarAction={avanzarEstadoAction}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold tracking-tight">Detalles</h2>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Destino</dt>
                <dd className="text-right font-medium text-foreground">
                  {actividad.sectorDestino}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Fecha</dt>
                <dd className="numeric-tnum text-right font-medium text-foreground">
                  {formatearFecha(actividad.fecha)}
                </dd>
              </div>
              {actividad.horaFin && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Hora de fin</dt>
                  <dd className="numeric-tnum text-right font-medium text-foreground">
                    {formatearHora(actividad.horaFin)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {actividad.puntosAcopio.length > 0 && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold tracking-tight">
                Centros de acopio
              </h2>
              <ul className="flex flex-col gap-3">
                {actividad.puntosAcopio.map((punto) => (
                  <li
                    key={punto.id}
                    className="flex flex-col gap-1.5 border-t border-border/60 pt-3 first:border-0 first:pt-0"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="mt-0.5 size-4 shrink-0 text-accent"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {punto.nombre}
                        </span>
                        {punto.referencia && (
                          <span className="text-xs text-muted-foreground [text-wrap:pretty]">
                            {punto.referencia}
                          </span>
                        )}
                      </div>
                    </div>
                    {punto.horarios && (
                      <p className="inline-flex items-center gap-1.5 pl-6 text-xs text-muted-foreground">
                        <Clock className="size-3.5" strokeWidth={1.5} aria-hidden />
                        {punto.horarios}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </PanelPage>
  );
}
