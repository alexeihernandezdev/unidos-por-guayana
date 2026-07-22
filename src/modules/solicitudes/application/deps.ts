import type { StoragePort } from "@/modules/archivos/domain/StoragePort";
import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { SolicitudRepository } from "@/modules/solicitudes/domain/SolicitudRepository";
import { esEditable } from "@/modules/solicitudes/domain/maquinaEstados";
import { esCantidadEstimadaValida } from "@/modules/solicitudes/domain/reglas";
import {
  DatosSolicitudInvalidosError,
  NoAutorizadoError,
  RecursoInvalidoError,
  SolicitudNoEditableError,
  SolicitudNoEncontradaError,
} from "./errors";

export type SolicitudDeps = {
  solicitudes: SolicitudRepository;
  recursos: RecursoRepository;
};

/**
 * Dependencias de los casos de uso de archivos (feature 031). Separadas de
 * `SolicitudDeps` para no obligar a los demás consumidores (p. ej. `PanelDeps`) a
 * inyectar el almacenamiento, que solo estos casos de uso necesitan.
 */
export type ArchivoSolicitudDeps = {
  solicitudes: SolicitudRepository;
  storage: StoragePort;
};

/**
 * Valida un recurso de solicitud: si viene `cantidadEstimada`, debe ser positiva y el
 * recurso debe existir y estar activo en el catálogo.
 */
export async function validarRecursoSolicitud(
  recursos: RecursoRepository,
  recursoId: string,
  cantidadEstimada?: number | null,
): Promise<void> {
  if (!esCantidadEstimadaValida(cantidadEstimada)) {
    throw new DatosSolicitudInvalidosError(
      "La cantidad estimada debe ser mayor que cero.",
    );
  }

  const recurso = await recursos.buscarPorId(recursoId);
  if (!recurso) {
    throw new RecursoInvalidoError("El recurso indicado no existe.");
  }
  if (!recurso.activo) {
    throw new RecursoInvalidoError(
      `El recurso "${recurso.nombre}" está archivado y no puede usarse en una solicitud.`,
    );
  }
}

/**
 * Carga una solicitud y comprueba que `actorId` es su dueño y que sigue editable
 * (`ABIERTA`). Reusado por los casos de uso de archivos (feature 031). El solicitante
 * puede gestionar sus archivos en cualquier momento mientras la solicitud siga
 * `ABIERTA` —desde su creación—, sin depender del estado de verificación de auditoría.
 */
export async function cargarSolicitudEditableDelDueno(
  solicitudes: SolicitudRepository,
  solicitudId: string,
  actorId: string,
): Promise<Solicitud> {
  const solicitud = await solicitudes.buscarPorId(solicitudId);
  if (!solicitud) {
    throw new SolicitudNoEncontradaError(solicitudId);
  }
  if (solicitud.solicitanteId !== actorId) {
    throw new NoAutorizadoError(
      "Solo el solicitante dueño puede gestionar los archivos de esta solicitud.",
    );
  }
  if (!esEditable(solicitud.estado)) {
    throw new SolicitudNoEditableError(
      "Solo se pueden gestionar archivos mientras la solicitud está ABIERTA.",
    );
  }
  return solicitud;
}
