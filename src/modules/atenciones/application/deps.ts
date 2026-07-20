import type { Actividad } from "@/modules/actividades/domain/Actividad";
import type { ActividadRepository } from "@/modules/actividades/domain/ActividadRepository";
import { esEditable } from "@/modules/actividades/domain/maquinaEstados";
import { esDueño } from "@/modules/actividades/domain/reglas";
import {
  ActividadNoEditableError,
  ActividadNoEncontradaError,
  ActividadNoPerteneceAlAdminError,
} from "@/modules/actividades/application/errors";
import type { AtencionRepository } from "@/modules/atenciones/domain/AtencionRepository";

// Dependencias que inyectan los casos de uso de atenciones. `atenciones` persiste el
// puente; `actividades` valida que la actividad destino exista, sea del ADMIN y siga
// editable (`RECOLECTANDO`). La capa se mantiene pura (solo contratos de dominio).
export type AtencionDeps = {
  atenciones: AtencionRepository;
  actividades: ActividadRepository;
};

/**
 * Punto único de verdad para operar sobre las metas/atenciones de una actividad: debe
 * existir, pertenecer al `adminId` y estar en `RECOLECTANDO` (las metas se congelan al
 * avanzar, igual que en `gestionarMetas`). Reutiliza los errores de actividades para
 * que la app los traduzca igual (404 / no editable).
 */
export async function assertActividadOperable(
  actividades: ActividadRepository,
  actividadId: string,
  adminId: string,
): Promise<Actividad> {
  const actividad = await actividades.buscarPorId(actividadId);
  if (!actividad) {
    throw new ActividadNoEncontradaError(actividadId);
  }
  if (!esDueño(actividad, adminId)) {
    throw new ActividadNoPerteneceAlAdminError(actividadId);
  }
  if (!esEditable(actividad.estado)) {
    throw new ActividadNoEditableError(
      "Solo se pueden vincular necesidades mientras la actividad está en RECOLECTANDO.",
    );
  }
  return actividad;
}
