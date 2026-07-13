import { notFound } from "next/navigation";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import { AporteForm } from "@/modules/aportes/ui/AporteForm";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerActividadServicio } from "@/shared/actividades";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { crearAporteAction } from "@/app/aportes/actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AportarPage({ params }: Props) {
  // COLABORADOR o ADMIN (el ADMIN puede aportar también, útil para pruebas).
  await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const { id } = await params;
  let ayuda;
  try {
    ayuda = await obtenerActividadServicio(id);
  } catch (error) {
    if (error instanceof ActividadNoEncontradaError) notFound();
    throw error;
  }

  const aceptaAportes = ayuda.estado === EstadoActividad.RECOLECTANDO;

  // Solo se puede aportar a recursos que estén en las metas de la Actividad.
  const opciones = ayuda.metas
    .filter((m) => m.recurso !== null)
    .map((m) => ({
      recursoId: m.recursoId,
      nombre: m.recurso!.nombre,
      unidad: m.recurso!.unidad,
    }));

  const accion = crearAporteAction.bind(null, ayuda.id);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title={`Aportar a ${ayuda.titulo}`}
        backHref={`/actividades/${ayuda.id}`}
        backLabel="Volver al detalle"
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
      </div>

      {!aceptaAportes ? (
        <p className="text-sm text-muted-foreground">
          Esta actividad ya no acepta aportes (estado actual: {ayuda.estado}).
        </p>
      ) : (
        <AporteForm
          action={accion}
          opciones={opciones}
          volverHref="/mis-aportes"
        />
      )}
    </PanelPage>
  );
}
