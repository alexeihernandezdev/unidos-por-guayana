import type { Actividad } from "@/modules/actividades/domain/Actividad";
import {
  esSectorValido,
  esTituloValido,
  hayRecursosRepetidos,
  normalizarDescripcion,
  normalizarTexto,
} from "@/modules/actividades/domain/reglas";
import {
  type TipoActividad,
  esTipoActividad,
} from "@/modules/actividades/domain/TipoActividad";
import { type ActividadDeps, validarMeta, validarPuntosAcopio } from "./deps";
import { DatosActividadInvalidosError } from "./errors";

export type CrearActividadInput = {
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  // Fin opcional (JORNADA/EVENTO_SOCIAL) y punto de acopio opcional (feature 024).
  horaFin?: Date | null;
  tipo: TipoActividad;
  descripcion?: string | null;
  // Ids de los centros de acopio propios donde se recibe/realiza (0..N, feature 026).
  puntosAcopioIds?: string[];
  metas: { recursoId: string; cantidadObjetivo: number }[];
};

/**
 * Crea una Actividad con sus metas iniciales, en estado `RECOLECTANDO`:
 * 1. Normaliza y valida la cabecera (título y sector no vacíos).
 * 2. Exige al menos una meta y rechaza recursos repetidos.
 * 3. Valida cada meta: `cantidadObjetivo > 0` y recurso existente y activo (004).
 * 4. Persiste el `adminId` del creador como dueño inmutable (feature 022).
 *
 * Caso de uso puro: solo depende de contratos de dominio (`ActividadRepository` y
 * `RecursoRepository`). La validación de formato ocurre también en el límite.
 */
export async function crearActividad(
  { actividades, recursos, puntos }: ActividadDeps,
  input: CrearActividadInput,
): Promise<Actividad> {
  const titulo = normalizarTexto(input.titulo);
  const sectorDestino = normalizarTexto(input.sectorDestino);
  const adminId = normalizarTexto(input.adminId);

  if (!adminId) {
    throw new DatosActividadInvalidosError(
      "La actividad debe tener un administrador dueño.",
    );
  }
  if (!esTituloValido(titulo)) {
    throw new DatosActividadInvalidosError("El título no puede estar vacío.");
  }
  if (!esSectorValido(sectorDestino)) {
    throw new DatosActividadInvalidosError(
      "El sector de destino no puede estar vacío.",
    );
  }
  if (!esTipoActividad(input.tipo)) {
    throw new DatosActividadInvalidosError("El tipo de actividad no es válido.");
  }
  if (input.metas.length === 0) {
    throw new DatosActividadInvalidosError("Añade al menos una meta de recurso.");
  }
  if (hayRecursosRepetidos(input.metas.map((m) => m.recursoId))) {
    throw new DatosActividadInvalidosError(
      "No repitas un recurso en dos metas de la misma actividad.",
    );
  }

  for (const meta of input.metas) {
    await validarMeta(recursos, meta.recursoId, meta.cantidadObjetivo);
  }

  const puntosAcopioIds = await validarPuntosAcopio(
    puntos,
    input.puntosAcopioIds ?? [],
    adminId,
  );

  return actividades.crear({
    adminId,
    titulo,
    sectorDestino,
    fecha: input.fecha,
    horaFin: input.horaFin ?? null,
    tipo: input.tipo,
    descripcion: normalizarDescripcion(input.descripcion),
    puntosAcopioIds,
    metas: input.metas.map((m) => ({
      recursoId: m.recursoId,
      cantidadObjetivo: m.cantidadObjetivo,
    })),
  });
}
