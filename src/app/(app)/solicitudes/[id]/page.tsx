import Link from "next/link";
import { notFound } from "next/navigation";
import { SolicitudNoEncontradaError } from "@/modules/solicitudes/application/errors";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { esEditable } from "@/modules/solicitudes/domain/maquinaEstados";
import { EstadoSolicitudBadge } from "@/modules/solicitudes/ui/EstadoSolicitudBadge";
import { UrgenciaBadge } from "@/modules/solicitudes/ui/UrgenciaBadge";
import { SolicitudAcciones } from "@/modules/solicitudes/ui/SolicitudAcciones";
import { formatearFechaCreacion } from "@/modules/solicitudes/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerSolicitudServicio } from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { cancelarSolicitudAction } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
};

async function cargarSolicitud(id: string, solicitanteId: string): Promise<Solicitud> {
  try {
    const solicitud = await obtenerSolicitudServicio(id);
    if (solicitud.solicitanteId !== solicitanteId) notFound();
    return solicitud;
  } catch (error) {
    if (error instanceof SolicitudNoEncontradaError) notFound();
    throw error;
  }
}

const celda = "px-3 py-2 text-sm align-middle";

export default async function SolicitudDetallePage({ params }: Props) {
  const usuario = await requireRol(Rol.SOLICITANTE);
  const { id } = await params;
  const solicitud = await cargarSolicitud(id, usuario.id);
  const editable = esEditable(solicitud.estado);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {solicitud.sector}
            </h1>
            <EstadoSolicitudBadge estado={solicitud.estado} />
            <UrgenciaBadge urgencia={solicitud.urgencia} />
          </div>
          <p className="text-sm text-muted-foreground">
            Creada el{" "}
            <span className="numeric-tnum text-foreground">
              {formatearFechaCreacion(solicitud.createdAt)}
            </span>
          </p>
          <p className="max-w-[65ch] text-sm text-foreground/80 [text-wrap:pretty]">
            {solicitud.descripcion}
          </p>
        </div>
        {editable && (
          <Button asChild variant="outline">
            <Link href={`/solicitudes/${solicitud.id}/editar`}>Editar</Link>
          </Button>
        )}
      </div>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Recursos necesarios</h2>
        {solicitud.recursos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Esta solicitud no tiene recursos definidos.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  <th className={celda}>Recurso</th>
                  <th className={celda}>Cantidad estimada</th>
                </tr>
              </thead>
              <tbody>
                {solicitud.recursos.map((recurso) => (
                  <tr
                    key={recurso.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className={celda}>
                      <span className="font-medium">
                        {recurso.recurso?.nombre ?? "Recurso"}
                      </span>
                    </td>
                    <td className={`${celda} numeric-tnum`}>
                      {recurso.cantidadEstimada != null
                        ? `${recurso.cantidadEstimada} ${recurso.recurso?.unidad ?? ""}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Acciones</h2>
        <SolicitudAcciones
          solicitudId={solicitud.id}
          estado={solicitud.estado}
          modo="solicitante"
          cancelarAction={cancelarSolicitudAction}
        />
      </section>

      <Link
        href="/solicitudes"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a mis solicitudes
      </Link>
    </main>
  );
}
