import { notFound } from "next/navigation";
import { Hash, Package } from "lucide-react";
import { SolicitudNoEncontradaError } from "@/modules/solicitudes/application/errors";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { esEditable } from "@/modules/solicitudes/domain/maquinaEstados";
import { EstadoSolicitudBadge } from "@/modules/solicitudes/ui/EstadoSolicitudBadge";
import { NecesidadAtendidaBadge } from "@/modules/solicitudes/ui/NecesidadAtendidaBadge";
import { UrgenciaBadge } from "@/modules/solicitudes/ui/UrgenciaBadge";
import { SolicitudAcciones } from "@/modules/solicitudes/ui/SolicitudAcciones";
import { formatearFechaCreacion } from "@/modules/solicitudes/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerSolicitudServicio } from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import {
  PanelList,
  PanelListRow,
  PanelPage,
  PanelPageSubHeader,
} from "@/shared/ui/panel";
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

export default async function SolicitudDetallePage({ params }: Props) {
  const usuario = await requireRol(Rol.SOLICITANTE);
  const { id } = await params;
  const solicitud = await cargarSolicitud(id, usuario.id);
  const editable = esEditable(solicitud.estado);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title={solicitud.sector}
        backHref="/solicitudes"
        backLabel="Volver a mis solicitudes"
        actions={
          editable && (
            <Button asChild variant="outline">
              <Link href={`/solicitudes/${solicitud.id}/editar`}>Editar</Link>
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <EstadoSolicitudBadge estado={solicitud.estado} />
          <UrgenciaBadge urgencia={solicitud.urgencia} />
        </div>
        <p className="text-sm text-muted-foreground">
          Creada el{" "}
          <span className="numeric-tnum font-mono text-foreground">
            {formatearFechaCreacion(solicitud.createdAt)}
          </span>
        </p>
        <p className="max-w-[65ch] text-sm text-foreground/80 [text-wrap:pretty]">
          {solicitud.descripcion}
        </p>
      </div>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Recursos necesarios</h2>
        {solicitud.recursos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Esta solicitud no tiene recursos definidos.
          </p>
        ) : (
          <PanelList>
            {solicitud.recursos.map((recurso) => (
              <PanelListRow
                key={recurso.id}
                icon={Package}
                title={recurso.recurso?.nombre ?? "Recurso"}
                badge={
                  recurso.atencion ? (
                    <NecesidadAtendidaBadge
                      atencion={recurso.atencion}
                      basePath="/actividades"
                    />
                  ) : undefined
                }
                meta={[
                  {
                    icon: Hash,
                    label: "Cantidad estimada",
                    texto:
                      recurso.cantidadEstimada != null ? (
                        <span className="numeric-tnum font-mono">
                          {recurso.cantidadEstimada}{" "}
                          {recurso.recurso?.unidad ?? ""}
                        </span>
                      ) : (
                        "—"
                      ),
                  },
                ]}
              />
            ))}
          </PanelList>
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
    </PanelPage>
  );
}
