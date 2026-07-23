import { notFound } from "next/navigation";
import { SolicitudNoEncontradaError } from "@/modules/solicitudes/application/errors";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { esEditable } from "@/modules/solicitudes/domain/maquinaEstados";
import { ArchivosSolicitud } from "@/modules/solicitudes/ui/ArchivosSolicitud";
import { SolicitudForm } from "@/modules/solicitudes/ui/SolicitudForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import {
  cargarArchivosVistaServicio,
  obtenerSolicitudServicio,
} from "@/shared/solicitudes";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { editarSolicitudAction } from "@/app/(app)/solicitudes/actions";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain";

type Props = {
  params: Promise<{ id: string }>;
};

// La página es accesible siempre que la solicitud sea del dueño y siga ABIERTA: ahí el
// solicitante puede gestionar sus archivos (incl. reintentos de subida). La edición de
// CAMPOS, en cambio, solo se habilita cuando auditoría pide información (se decide en el
// render, no aquí), preservando la regla de auditoría.
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

  // Los campos solo se editan cuando auditoría solicita información adicional; en el resto
  // de estados ABIERTA esta página sirve solo para gestionar archivos.
  const puedeEditarCampos =
    solicitud.estadoVerificacion ===
    EstadoVerificacionSolicitud.REQUIERE_INFORMACION;

  // El catálogo (recursos + ubicación) solo hace falta para editar campos; se evita la
  // consulta cuando la página se usa únicamente para gestionar archivos.
  const [recursos, ubicacion] = puedeEditarCampos
    ? await Promise.all([
        listarRecursosServicio({ soloSeleccionables: true }).then((lista) =>
          lista.map((r) => ({ id: r.id, nombre: r.nombre, unidad: r.unidad })),
        ),
        cargarCatalogoUbicacion(),
      ])
    : [[], { estados: [], municipios: [] }];

  const editar = (input: Parameters<typeof editarSolicitudAction>[1]) =>
    editarSolicitudAction(id, input);

  const archivos = await cargarArchivosVistaServicio(solicitud);

  return (
    <PanelPage>
      <PanelPageSubHeader
        title={puedeEditarCampos ? "Editar solicitud" : "Archivos de la solicitud"}
        description={`Sector: ${solicitud.sector}`}
        backHref={`/solicitudes/${id}`}
        backLabel="Volver al detalle"
      />

      {puedeEditarCampos ? (
        <SolicitudForm
          action={editar}
          recursos={recursos}
          estados={ubicacion.estados}
          municipios={ubicacion.municipios}
          valoresIniciales={{
            sector: solicitud.sector,
            estadoId: solicitud.estadoId,
            municipioId: solicitud.municipioId,
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
      ) : (
        <p className="max-w-2xl text-sm text-muted-foreground">
          Los datos de la solicitud (sector, urgencia, descripción y recursos)
          solo pueden editarse cuando auditoría solicite información adicional.
          Mientras tanto, puedes añadir o quitar la imagen y los documentos.
        </p>
      )}

      <ArchivosSolicitud
        solicitudId={solicitud.id}
        principalInicial={archivos.principal}
        adjuntosIniciales={archivos.adjuntos}
      />
    </PanelPage>
  );
}
