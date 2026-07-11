import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { siguienteEstado } from "@/modules/ayudas/domain/maquinaEstados";
import { type AyudaDeps, assertEsDueño } from "./deps";
import { AyudaNoEncontradaError, TransicionInvalidaError } from "./errors";

/**
 * Avanza el estado de una Ayuda por la secuencia válida
 * `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`. Solo el dueño puede
 * avanzar (feature 022). Si ya es terminal (`ENTREGADO`), lanza
 * `TransicionInvalidaError`. La máquina de estados vive en el dominio.
 */
export async function avanzarEstado(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  id: string,
  adminId: string,
): Promise<Ayuda> {
  const ayuda = await ayudas.buscarPorId(id);
  if (!ayuda) {
    throw new AyudaNoEncontradaError(id);
  }
  assertEsDueño(ayuda, adminId);

  const siguiente = siguienteEstado(ayuda.estado);
  if (!siguiente) {
    throw new TransicionInvalidaError(
      `La ayuda ya está en el estado final (${ayuda.estado}); no puede avanzar más.`,
    );
  }

  return ayudas.cambiarEstado(id, siguiente);
}
