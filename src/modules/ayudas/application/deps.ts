import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import type { AyudaRepository } from "@/modules/ayudas/domain/AyudaRepository";
import { esCantidadObjetivoValida } from "@/modules/ayudas/domain/reglas";
import { DatosAyudaInvalidosError, RecursoInvalidoError } from "./errors";

// Dependencias que inyectan los casos de uso de ayudas. `recursos` (contrato del
// catálogo, feature 004) se usa para validar que cada meta apunte a un recurso
// existente y activo. Ambas son interfaces de dominio: la capa se mantiene pura.
export type AyudaDeps = {
  ayudas: AyudaRepository;
  recursos: RecursoRepository;
};

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
    throw new DatosAyudaInvalidosError(
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
