import Link from "next/link";
import { notFound } from "next/navigation";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import { AporteForm } from "@/modules/aportes/ui/AporteForm";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Aportar a {ayuda.titulo}
          </h1>
          <EstadoBadge estado={ayuda.estado} />
        </div>
        <p className="text-sm text-muted-foreground">
          Destino: <span className="text-foreground">{ayuda.sectorDestino}</span>
          {" · "}
          Salida:{" "}
          <span className="numeric-tnum text-foreground">
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

      <Link
        href="/mis-aportes"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Ver mis aportes
      </Link>
    </main>
  );
}
