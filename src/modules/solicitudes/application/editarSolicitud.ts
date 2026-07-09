import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { esEditable } from "@/modules/solicitudes/domain/maquinaEstados";
import {
  esDescripcionValida,
  esSectorValido,
  esUrgenciaValida,
  hayRecursosRepetidos,
  normalizarTexto,
} from "@/modules/solicitudes/domain/reglas";
import { type SolicitudDeps, validarRecursoSolicitud } from "./deps";
import {
  DatosSolicitudInvalidosError,
  NoAutorizadoError,
  SolicitudNoEditableError,
  SolicitudNoEncontradaError,
} from "./errors";

export type EditarSolicitudInput = {
  sector?: string;
  urgencia?: UrgenciaSolicitud;
  descripcion?: string;
  recursos?: { recursoId: string; cantidadEstimada?: number | null }[];
};

export async function editarSolicitud(
  { solicitudes, recursos }: SolicitudDeps,
  id: string,
  input: EditarSolicitudInput,
  actorId: string,
): Promise<Solicitud> {
  const actual = await solicitudes.buscarPorId(id);
  if (!actual) {
    throw new SolicitudNoEncontradaError(id);
  }
  if (actual.solicitanteId !== actorId) {
    throw new NoAutorizadoError(
      "Solo el solicitante dueño puede editar esta solicitud.",
    );
  }
  if (!esEditable(actual.estado)) {
    throw new SolicitudNoEditableError(
      "Solo se puede editar una solicitud mientras está ABIERTA.",
    );
  }

  const cambios: {
    sector?: string;
    urgencia?: UrgenciaSolicitud;
    descripcion?: string;
  } = {};

  if (input.sector !== undefined) {
    const sector = normalizarTexto(input.sector);
    if (!esSectorValido(sector)) {
      throw new DatosSolicitudInvalidosError("El sector no puede estar vacío.");
    }
    cambios.sector = sector;
  }

  if (input.urgencia !== undefined) {
    if (!esUrgenciaValida(input.urgencia)) {
      throw new DatosSolicitudInvalidosError(
        "La urgencia indicada no es válida.",
      );
    }
    cambios.urgencia = input.urgencia;
  }

  if (input.descripcion !== undefined) {
    const descripcion = normalizarTexto(input.descripcion);
    if (!esDescripcionValida(descripcion)) {
      throw new DatosSolicitudInvalidosError(
        "La descripción no puede estar vacía.",
      );
    }
    cambios.descripcion = descripcion;
  }

  let resultado = actual;

  if (Object.keys(cambios).length > 0) {
    resultado = await solicitudes.actualizarCabecera(id, cambios);
  }

  if (input.recursos !== undefined) {
    if (input.recursos.length === 0) {
      throw new DatosSolicitudInvalidosError(
        "Añade al menos un recurso necesario.",
      );
    }
    if (hayRecursosRepetidos(input.recursos.map((r) => r.recursoId))) {
      throw new DatosSolicitudInvalidosError(
        "No repitas un recurso en la misma solicitud.",
      );
    }
    for (const recurso of input.recursos) {
      await validarRecursoSolicitud(
        recursos,
        recurso.recursoId,
        recurso.cantidadEstimada,
      );
    }
    resultado = await solicitudes.reemplazarRecursos(
      id,
      input.recursos.map((r) => ({
        recursoId: r.recursoId,
        cantidadEstimada: r.cantidadEstimada ?? null,
      })),
    );
  }

  return resultado;
}
