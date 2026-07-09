import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import {
  esCantidadAporteValida,
  normalizarNota,
} from "@/modules/aportes/domain/reglas";
import type { AporteDeps } from "./deps";
import {
  AyudaNoAceptaAportesError,
  DatosAporteInvalidosError,
  RecursoFueraDeMetasError,
} from "./errors";
import { AyudaNoEncontradaError } from "@/modules/ayudas/application/errors";

export type CrearAporteInput = {
  ayudaId: string;
  recursoId: string;
  colaboradorId: string;
  cantidad: number;
  nota?: string | null;
};

/**
 * Crea un aporte en estado `COMPROMETIDO`.
 * 1. Ayuda existe y sigue en `RECOLECTANDO` (tras `LISTO` no se aceptan aportes).
 * 2. El recurso está entre las metas de la Ayuda (no se aportan recursos que la
 *    Ayuda no pidió; los desalineados van a Solicitudes, feature 007).
 * 3. El recurso del catálogo está activo (no archivado).
 * 4. `cantidad > 0`.
 *
 * Caso de uso puro: solo depende de contratos de dominio.
 */
export async function crearAporte(
  { aportes, ayudas, recursos }: AporteDeps,
  input: CrearAporteInput,
): Promise<Aporte> {
  if (!esCantidadAporteValida(input.cantidad)) {
    throw new DatosAporteInvalidosError("La cantidad debe ser mayor que cero.");
  }

  const ayuda = await ayudas.buscarPorId(input.ayudaId);
  if (!ayuda) throw new AyudaNoEncontradaError(input.ayudaId);
  if (ayuda.estado !== EstadoAyuda.RECOLECTANDO) {
    throw new AyudaNoAceptaAportesError(
      `La ayuda ya está en ${ayuda.estado}; solo se aceptan aportes mientras esté RECOLECTANDO.`,
    );
  }

  const enMetas = ayuda.metas.some((m) => m.recursoId === input.recursoId);
  if (!enMetas) {
    throw new RecursoFueraDeMetasError(
      "El recurso indicado no forma parte de las metas de esta ayuda.",
    );
  }

  const recurso = await recursos.buscarPorId(input.recursoId);
  if (!recurso) {
    throw new RecursoFueraDeMetasError("El recurso indicado no existe.");
  }
  if (!recurso.activo) {
    throw new RecursoFueraDeMetasError(
      `El recurso "${recurso.nombre}" está archivado y no puede recibir aportes.`,
    );
  }

  return aportes.crear({
    ayudaId: input.ayudaId,
    recursoId: input.recursoId,
    colaboradorId: input.colaboradorId,
    cantidad: input.cantidad,
    nota: normalizarNota(input.nota),
  });
}
