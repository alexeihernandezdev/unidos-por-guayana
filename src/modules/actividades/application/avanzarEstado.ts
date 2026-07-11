import type { Actividad } from "@/modules/actividades/domain/Actividad";
import { siguienteEstado } from "@/modules/actividades/domain/maquinaEstados";
import { type ActividadDeps, assertEsDueño } from "./deps";
import { ActividadNoEncontradaError, TransicionInvalidaError } from "./errors";

/**
 * Avanza el estado de una Actividad por la secuencia válida de su `tipo`
 * (feature 024): `ENVIO` sigue `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`;
 * `JORNADA`/`EVENTO_SOCIAL` siguen `RECOLECTANDO → LISTA → EN_CURSO → REALIZADA`.
 * Solo el dueño puede avanzar (feature 022). Si ya es terminal, lanza
 * `TransicionInvalidaError`. La máquina de estados vive en el dominio.
 */
export async function avanzarEstado(
  { actividades }: Pick<ActividadDeps, "actividades">,
  id: string,
  adminId: string,
): Promise<Actividad> {
  const actividad = await actividades.buscarPorId(id);
  if (!actividad) {
    throw new ActividadNoEncontradaError(id);
  }
  assertEsDueño(actividad, adminId);

  const siguiente = siguienteEstado(actividad.tipo, actividad.estado);
  if (!siguiente) {
    throw new TransicionInvalidaError(
      `La actividad ya está en el estado final (${actividad.estado}); no puede avanzar más.`,
    );
  }

  return actividades.cambiarEstado(id, siguiente);
}
