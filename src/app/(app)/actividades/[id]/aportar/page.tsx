import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import { AporteForm } from "@/modules/aportes/ui/AporteForm";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { TipoBadge } from "@/modules/actividades/ui/TipoBadge";
import { ESTADO_LABEL } from "@/modules/actividades/ui/estados";
import { formatearFecha, formatearHora } from "@/modules/actividades/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerActividadServicio } from "@/shared/actividades";
import { requireRol } from "@/shared/auth";
import { crearAporteAction } from "@/app/aportes/actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AportarPage({ params }: Props) {
  // COLABORADOR o ADMIN (el ADMIN puede aportar también, útil para pruebas).
  await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const { id } = await params;
  let actividad;
  try {
    actividad = await obtenerActividadServicio(id);
  } catch (error) {
    if (error instanceof ActividadNoEncontradaError) notFound();
    throw error;
  }

  const aceptaAportes = actividad.estado === EstadoActividad.RECOLECTANDO;

  // Solo se puede aportar a recursos que estén en las metas de la Actividad.
  const opciones = actividad.metas
    .filter((m) => m.recurso !== null)
    .map((m) => ({
      recursoId: m.recursoId,
      nombre: m.recurso!.nombre,
      unidad: m.recurso!.unidad,
    }));

  const accion = crearAporteAction.bind(null, actividad.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6 md:p-8">
      <Link
        href={`/actividades/${actividad.id}`}
        className="focus-ring group inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft
          className="size-4 transition-transform duration-200 ease-[var(--ease-out-emil)] group-hover:-translate-x-0.5 motion-reduce:transition-none"
          strokeWidth={1.5}
          aria-hidden
        />
        Volver a la actividad
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TipoBadge tipo={actividad.tipo} />
          <EstadoBadge estado={actividad.estado} />
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight [text-wrap:balance] md:text-4xl">
          {actividad.titulo}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="flex flex-col gap-4">
          {!aceptaAportes ? (
            <p className="text-sm text-muted-foreground">
              Esta actividad ya no acepta aportes. Estado actual:{" "}
              <span className="font-medium text-foreground">
                {ESTADO_LABEL[actividad.estado]}
              </span>
              .
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Registrar tu aporte
                </h2>
                <p className="text-sm text-muted-foreground">
                  Elige qué recurso aportas y cuánto. El centro confirmará la
                  recepción.
                </p>
              </div>
              <AporteForm
                action={accion}
                opciones={opciones}
                volverHref="/mis-aportes"
              />
            </>
          )}
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
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
            <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
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
    </main>
  );
}
