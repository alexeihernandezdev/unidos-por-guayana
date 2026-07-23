import type { StoragePort } from "@/modules/archivos/domain/StoragePort";
import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { dedupeIds, esDueño } from "@/modules/actividades/domain/reglas";
import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import type { ActividadRepository } from "@/modules/actividades/domain/ActividadRepository";
import { esCantidadObjetivoValida } from "@/modules/actividades/domain/reglas";
import type { PuntoAcopioRepository } from "@/modules/acopio/domain/PuntoAcopioRepository";
import {
  ActividadNoEncontradaError,
  ActividadNoPerteneceAlAdminError,
  DatosActividadInvalidosError,
  PuntoAcopioInvalidoError,
  RecursoInvalidoError,
} from "./errors";

// Dependencias que inyectan los casos de uso de actividades. `recursos` (contrato
// del catálogo, feature 004) valida que cada meta apunte a un recurso existente y
// activo. `puntos` (contrato de acopio, feature 011) es opcional: solo hace falta
// cuando se asocia un `puntoAcopioId` (feature 024). Todas son interfaces de
// dominio: la capa se mantiene pura.
export type ActividadDeps = {
  actividades: ActividadRepository;
  recursos: RecursoRepository;
  puntos?: PuntoAcopioRepository;
};

/**
 * Dependencias de los casos de uso de archivos (feature 033). Separadas de
 * `ActividadDeps` para no obligar a los demás consumidores a inyectar el
 * almacenamiento, que solo estos casos de uso necesitan.
 */
export type ArchivoActividadDeps = {
  actividades: ActividadRepository;
  storage: StoragePort;
};

/**
 * Carga una actividad y comprueba que `actorId` es su dueño (feature 022). A diferencia
 * de la edición de cabecera, la gestión de archivos NO exige estado `RECOLECTANDO`: el
 * ADMIN dueño puede subir/quitar imágenes en cualquier estado (feature 033). El único
 * gate es la propiedad.
 */
export async function cargarActividadDelDueno(
  actividades: ActividadRepository,
  actividadId: string,
  actorId: string,
): Promise<Actividad> {
  const actividad = await actividades.buscarPorId(actividadId);
  if (!actividad) {
    throw new ActividadNoEncontradaError(actividadId);
  }
  if (!esDueño(actividad, actorId)) {
    throw new ActividadNoPerteneceAlAdminError(actividadId);
  }
  return actividad;
}

/**
 * Valida una meta que se va a persistir: la `cantidadObjetivo` debe ser positiva y
 * el recurso debe existir y estar **activo** en el catálogo. Lanza el error de
 * aplicación correspondiente si algo falla.
 */
export async function validarMeta(
  recursos: RecursoRepository,
  recursoId: string,
  cantidadObjetivo: number,
): Promise<void> {
  if (!esCantidadObjetivoValida(cantidadObjetivo)) {
    throw new DatosActividadInvalidosError(
      "La cantidad objetivo debe ser mayor que cero.",
    );
  }

  const recurso = await recursos.buscarPorId(recursoId);
  if (!recurso) {
    throw new RecursoInvalidoError("El recurso indicado no existe.");
  }
  if (!recurso.activo) {
    throw new RecursoInvalidoError(
      `El recurso "${recurso.nombre}" está archivado y no puede usarse en una meta.`,
    );
  }
}

/**
 * Valida el `puntoAcopioId` opcional de una actividad (feature 024): debe existir,
 * estar activo y pertenecer al mismo `adminId` dueño de la actividad. Requiere el
 * contrato `puntos` en las dependencias.
 */
export async function validarPuntoAcopio(
  puntos: PuntoAcopioRepository | undefined,
  puntoAcopioId: string,
  adminId: string,
): Promise<void> {
  if (!puntos) {
    throw new PuntoAcopioInvalidoError(
      "No se puede validar el centro de acopio indicado.",
    );
  }
  const punto = await puntos.buscarPorId(puntoAcopioId);
  if (!punto || !punto.activo) {
    throw new PuntoAcopioInvalidoError(
      "El centro de acopio indicado no existe o está archivado.",
    );
  }
  if (punto.adminId !== adminId) {
    throw new PuntoAcopioInvalidoError(
      "El centro de acopio no pertenece a este administrador.",
    );
  }
}

/**
 * Valida un conjunto de puntos de acopio (feature 026): deduplica los ids y valida
 * cada uno (existe, activo y propio del `adminId` dueño). Devuelve la lista limpia
 * (sin repetidos ni vacíos) lista para persistir. Un array vacío es válido: una
 * actividad puede no tener centros asignados.
 */
export async function validarPuntosAcopio(
  puntos: PuntoAcopioRepository | undefined,
  ids: readonly string[],
  adminId: string,
): Promise<string[]> {
  const limpios = dedupeIds(ids);
  for (const id of limpios) {
    await validarPuntoAcopio(puntos, id, adminId);
  }
  return limpios;
}

/**
 * Punto único de verdad de la propiedad (feature 022): si el solicitante no es
 * el dueño, lanza `ActividadNoPerteneceAlAdminError` (la app lo traduce a 404).
 */
export function assertEsDueño(actividad: Actividad, adminId: string): void {
  if (!esDueño(actividad, adminId)) {
    throw new ActividadNoPerteneceAlAdminError(actividad.id);
  }
}
