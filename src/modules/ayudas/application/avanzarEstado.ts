import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { siguienteEstado } from "@/modules/ayudas/domain/maquinaEstados";
import { type AyudaDeps, assertEsDueño } from "./deps";
import { AyudaNoEncontradaError, TransicionInvalidaError } from "./errors";

// Detalle opcional que el ADMIN adjunta al avanzar de estado (feature 010): una
// nota ("salió del acopio de San Félix") y una evidencia (URL a una foto). Ambas
// son opcionales en el MVP, incluso al pasar a ENTREGADO. `registradoPor` es el id
// del ADMIN, para auditoría interna: nunca se expone en superficies públicas.
export type DetalleAvance = {
  nota?: string | null;
  evidenciaUrl?: string | null;
  registradoPor?: string | null;
};

/**
 * Avanza el estado de una Ayuda por la secuencia válida
 * `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`. Solo el dueño puede
 * avanzar (feature 022). Si ya es terminal (`ENTREGADO`), lanza
 * `TransicionInvalidaError`. La máquina de estados vive en el dominio.
 *
 * Cada transición registra un `SeguimientoEvento` de forma **atómica** con el
 * cambio de estado (feature 010); la atomicidad la resuelve la infraestructura
 * (`avanzarConSeguimiento`). Este caso de uso permanece puro.
 */
export async function avanzarEstado(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  id: string,
  adminId: string,
  detalle?: DetalleAvance,
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

  return ayudas.avanzarConSeguimiento(id, siguiente, {
    estadoAnterior: ayuda.estado,
    estadoNuevo: siguiente,
    nota: detalle?.nota ?? null,
    evidenciaUrl: detalle?.evidenciaUrl ?? null,
    registradoPor: detalle?.registradoPor ?? adminId,
  });
}
