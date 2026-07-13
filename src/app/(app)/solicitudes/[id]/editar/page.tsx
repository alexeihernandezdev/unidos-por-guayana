import { notFound } from "next/navigation";
import { SolicitudNoEncontradaError } from "@/modules/solicitudes/application/errors";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { esEditable } from "@/modules/solicitudes/domain/maquinaEstados";
import { SolicitudForm } from "@/modules/solicitudes/ui/SolicitudForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import { obtenerSolicitudServicio } from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { editarSolicitudAction } from "@/app/(app)/solicitudes/actions";

type Props = {
  params: Promise<{ id: string }>;
};

async function cargarSolicitud(id: string, solicitanteId: string): Promise<Solicitud> {
  try {
    const solicitud = await obtenerSolicitudServicio(id);
    if (solicitud.solicitanteId !== solicitanteId) notFound();
    if (!esEditable(solicitud.estado)) notFound();
    return solicitud;
  } catch (error) {
    if (error instanceof SolicitudNoEncontradaError) notFound();
    throw error;
  }
}

export default async function EditarSolicitudPage({ params }: Props) {
  const usuario = await requireRol(Rol.SOLICITANTE);
  const { id } = await params;
  const solicitud = await cargarSolicitud(id, usuario.id);

  const recursos = (
    await listarRecursosServicio({ soloSeleccionables: true })
  ).map(
    (r) => ({
      id: r.id,
      nombre: r.nombre,
      unidad: r.unidad,
    }),
  );

  const editar = (input: Parameters<typeof editarSolicitudAction>[1]) =>
    editarSolicitudAction(id, input);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Editar solicitud"
        description={`Sector: ${solicitud.sector}`}
        backHref={`/solicitudes/${id}`}
        backLabel="Volver al detalle"
      />

      <SolicitudForm
        action={editar}
        recursos={recursos}
        valoresIniciales={{
          sector: solicitud.sector,
          urgencia: solicitud.urgencia,
          descripcion: solicitud.descripcion,
          recursos: solicitud.recursos.map((r) => ({
            recursoId: r.recursoId,
            cantidadEstimada: r.cantidadEstimada,
          })),
        }}
        textoEnviar="Guardar cambios"
        textoEnviando="Guardando…"
        rutaExito={`/solicitudes/${id}`}
      />
    </PanelPage>
  );
}
