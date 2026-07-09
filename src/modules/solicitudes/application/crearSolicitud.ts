import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import {
  esDescripcionValida,
  esSectorValido,
  esUrgenciaValida,
  hayRecursosRepetidos,
  normalizarTexto,
} from "@/modules/solicitudes/domain/reglas";
import { type SolicitudDeps, validarRecursoSolicitud } from "./deps";
import { DatosSolicitudInvalidosError } from "./errors";

export type CrearSolicitudInput = {
  sector: string;
  urgencia: UrgenciaSolicitud;
  descripcion: string;
  recursos: { recursoId: string; cantidadEstimada?: number | null }[];
};

export async function crearSolicitud(
  { solicitudes, recursos }: SolicitudDeps,
  input: CrearSolicitudInput,
  solicitanteId: string,
): Promise<Solicitud> {
  const sector = normalizarTexto(input.sector);
  const descripcion = normalizarTexto(input.descripcion);

  if (!esSectorValido(sector)) {
    throw new DatosSolicitudInvalidosError("El sector no puede estar vacío.");
  }
  if (!esDescripcionValida(descripcion)) {
    throw new DatosSolicitudInvalidosError(
      "La descripción no puede estar vacía.",
    );
  }
  if (!esUrgenciaValida(input.urgencia)) {
    throw new DatosSolicitudInvalidosError("La urgencia indicada no es válida.");
  }
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

  return solicitudes.crear({
    sector,
    urgencia: input.urgencia,
    descripcion,
    solicitanteId,
    recursos: input.recursos.map((r) => ({
      recursoId: r.recursoId,
      cantidadEstimada: r.cantidadEstimada ?? null,
    })),
  });
}
