import Link from "next/link";
import { notFound } from "next/navigation";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
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

// Detalle del envío para el colaborador autenticado: cabecera, progreso por meta
// (reusa `ProgresoMetas`), registro de aportantes (feature 023) y el botón
// "Aportar" cuando el envío sigue en `RECOLECTANDO`. Los nombres de aportantes
// solo se cargan con sesión (gate de privacidad de 023).
export default async function ActividadDetallePublicoPage({ params }: Props) {
  const usuario = await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const { id } = await params;
  let ayuda;
  try {
    ayuda = await obtenerActividadServicio(id);
  } catch (error) {
    if (error instanceof ActividadNoEncontradaError) notFound();
    throw error;
  }

  const [progreso, aportantes] = await Promise.all([
    progresoDeActividadServicio(ayuda.id),
    usuario
      ? listarAportantesDeActividadServicio(ayuda.id)
      : Promise.resolve(null),
  ]);
  const aceptaAportes = ayuda.estado === EstadoActividad.RECOLECTANDO;

  return (
    <PanelPage>
      <PanelPageSubHeader
        title={ayuda.titulo}
        backHref="/actividades"
        backLabel="Volver a las actividades abiertas"
        actions={
          aceptaAportes && (
            <Button asChild>
              <Link href={`/actividades/${ayuda.id}/aportar`}>Aportar</Link>
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <EstadoBadge estado={ayuda.estado} />
        </div>
        <p className="text-sm text-muted-foreground">
          Destino: <span className="text-foreground">{ayuda.sectorDestino}</span>
          {" · "}
          Salida:{" "}
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
        {!aceptaAportes && (
          <p className="text-sm text-muted-foreground">
            Esta actividad ya no acepta aportes (estado actual: {ayuda.estado}).
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Quiénes han aportado</h2>
        {aportantes ? (
          <AportantesTabla aportantes={aportantes} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Inicia sesión para ver quiénes han aportado a esta actividad.{" "}
            <Link
              href="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        )}
      </section>
    </PanelPage>
  );
}
