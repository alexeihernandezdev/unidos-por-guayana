import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import {
  esCantidadAporteValida,
  normalizarNota,
} from "@/modules/aportes/domain/reglas";
import type { AporteDeps } from "./deps";
import {
  ActividadNoAceptaAportesError,
  DatosAporteInvalidosError,
  RecursoFueraDeMetasError,
} from "./errors";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";

export type CrearAporteInput = {
  actividadId: string;
  recursoId: string;
  colaboradorId: string;
  cantidad: number;
  nota?: string | null;
};

/**
 * Crea un aporte en estado `COMPROMETIDO`.
 * 1. Actividad existe y sigue en `RECOLECTANDO` (tras `LISTO` no se aceptan aportes).
 * 2. El recurso está entre las metas de la Actividad (no se aportan recursos que la
 *    Actividad no pidió; los desalineados van a Solicitudes, feature 007).
 * 3. El recurso del catálogo está activo (no archivado).
 * 4. `cantidad > 0`.
 *
 * Caso de uso puro: solo depende de contratos de dominio.
 */
export async function crearAporte(
  { aportes, actividades, recursos }: AporteDeps,
  input: CrearAporteInput,
): Promise<Aporte> {
  if (!esCantidadAporteValida(input.cantidad)) {
    throw new DatosAporteInvalidosError("La cantidad debe ser mayor que cero.");
  }

  const ayuda = await actividades.buscarPorId(input.actividadId);
  if (!ayuda) throw new ActividadNoEncontradaError(input.actividadId);
  if (ayuda.estado !== EstadoActividad.RECOLECTANDO) {
    throw new ActividadNoAceptaAportesError(
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
    actividadId: input.actividadId,
    recursoId: input.recursoId,
    colaboradorId: input.colaboradorId,
    cantidad: input.cantidad,
    nota: normalizarNota(input.nota),
  });
}
