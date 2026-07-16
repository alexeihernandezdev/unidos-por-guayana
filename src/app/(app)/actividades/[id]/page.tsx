import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin } from "lucide-react";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { TipoBadge } from "@/modules/actividades/ui/TipoBadge";
import { ESTADO_LABEL } from "@/modules/actividades/ui/estados";
import { formatearFecha, formatearHora } from "@/modules/actividades/ui/fechas";
import { AportantesTabla } from "@/modules/aportes/ui/AportantesTabla";
import { ProgresoMetas } from "@/modules/aportes/ui/ProgresoMetas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  listarAportantesDeActividadServicio,
  progresoDeActividadServicio,
} from "@/shared/aportes";
import { requireRol } from "@/shared/auth";
import { obtenerActividadServicio } from "@/shared/actividades";
import { Button } from "@/shared/ui/button";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";

type Props = {
  params: Promise<{ id: string }>;
};

// Detalle de la actividad para el colaborador autenticado. Layout en dos columnas
// (feature 026): a la izquierda el progreso por meta (023) y el registro de
// aportantes (023); a la derecha un panel de datos y "Dónde entregar" (centros
// asignados). El CTA "Aportar" aparece si sigue en RECOLECTANDO.
export default async function ActividadDetallePublicoPage({ params }: Props) {
  const usuario = await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const { id } = await params;
  let actividad;
  try {
    actividad = await obtenerActividadServicio(id);
  } catch (error) {
    if (error instanceof ActividadNoEncontradaError) notFound();
    throw error;
  }

  const [progreso, aportantes] = await Promise.all([
    progresoDeActividadServicio(actividad.id),
    usuario
      ? listarAportantesDeActividadServicio(actividad.id)
      : Promise.resolve(null),
  ]);
  const aceptaAportes = actividad.estado === EstadoActividad.RECOLECTANDO;

  return (
    <PanelPage>
      <PanelPageSubHeader
        animated
        title={actividad.titulo}
        backHref="/actividades"
        backLabel="Volver a las actividades abiertas"
        actions={
          aceptaAportes && (
            <Button asChild>
              <Link href={`/actividades/${actividad.id}/aportar`}>Aportar</Link>
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

      <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Metas de recursos
            </h2>
            <ProgresoMetas progreso={progreso} />
            {!aceptaAportes && (
              <p className="text-sm text-muted-foreground">
                Esta actividad ya no acepta aportes. Estado actual:{" "}
                <span className="font-medium text-foreground">
                  {ESTADO_LABEL[actividad.estado]}
                </span>
                .
              </p>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Quiénes han aportado
            </h2>
            {aportantes ? (
              <AportantesTabla aportantes={aportantes} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Inicia sesión para ver quiénes han aportado a esta actividad.{" "}
                <Link
                  href="/login"
                  className="text-primary-ink underline-offset-4 hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
          <div className="card-lift flex flex-col gap-3 rounded-lg border border-border p-4">
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
            <div className="card-lift flex flex-col gap-3 rounded-lg border border-border p-4">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-semibold tracking-tight">
                  Dónde entregar
                </h2>
                <p className="text-xs text-muted-foreground">
                  Centros donde puedes llevar tu aporte.
                </p>
              </div>
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
