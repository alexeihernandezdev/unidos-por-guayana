import { notFound } from "next/navigation";
import { Hash, Package } from "lucide-react";
import { SolicitudNoEncontradaError } from "@/modules/solicitudes/application/errors";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { ArchivosSolicitudVista } from "@/modules/solicitudes/ui/ArchivosSolicitudVista";
import { EstadoSolicitudBadge } from "@/modules/solicitudes/ui/EstadoSolicitudBadge";
import { NecesidadAtendidaBadge } from "@/modules/solicitudes/ui/NecesidadAtendidaBadge";
import { UrgenciaBadge } from "@/modules/solicitudes/ui/UrgenciaBadge";
import { SolicitudAcciones } from "@/modules/solicitudes/ui/SolicitudAcciones";
import { formatearFechaCreacion } from "@/modules/solicitudes/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  cargarArchivosVistaServicio,
  obtenerSolicitudServicio,
} from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import {
  PanelList,
  PanelListRow,
  PanelPage,
  PanelPageSubHeader,
} from "@/shared/ui/panel";
import { cerrarSolicitudAction, marcarAtendidaAction } from "../actions";
import { ResumenAuditoriaSolicitud } from "@/modules/auditoria/ui";
import { obtenerAuditoriaAdministracionServicio } from "@/shared/auditoria";

type Props = {
  params: Promise<{ id: string }>;
};

async function cargarSolicitud(id: string): Promise<Solicitud> {
  try {
    return await obtenerSolicitudServicio(id);
  } catch (error) {
    if (error instanceof SolicitudNoEncontradaError) notFound();
    throw error;
  }
}

export default async function SolicitudAdminDetallePage({ params }: Props) {
  await requireRol(Rol.ADMIN);

  const { id } = await params;
  const solicitud = await cargarSolicitud(id);
  const [archivos, auditoria] = await Promise.all([
    cargarArchivosVistaServicio(solicitud),
    obtenerAuditoriaAdministracionServicio(solicitud.id),
  ]);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title={solicitud.sector}
        backHref="/panel/solicitudes"
        backLabel="Volver a las solicitudes"
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
                      basePath="/panel/actividades"
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

      <ArchivosSolicitudVista archivos={archivos} />

      {auditoria ? (
        <ResumenAuditoriaSolicitud auditoria={auditoria} modo="admin" />
      ) : null}

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Gestión</h2>
        <p className="text-sm text-muted-foreground">
          Marca la solicitud como atendida cuando esté cubierta por una actividad, o
          ciérrala si ya no aplica.
        </p>
        <SolicitudAcciones
          solicitudId={solicitud.id}
          estado={solicitud.estado}
          estadoVerificacion={solicitud.estadoVerificacion}
          modo="admin"
          marcarAtendidaAction={marcarAtendidaAction}
          cerrarAction={cerrarSolicitudAction}
        />
      </section>
    </PanelPage>
  );
}
