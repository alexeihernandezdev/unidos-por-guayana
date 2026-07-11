import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import {
  esSectorValido,
  esTituloValido,
  hayRecursosRepetidos,
  normalizarDescripcion,
  normalizarTexto,
} from "@/modules/ayudas/domain/reglas";
import {
  type TipoActividad,
  esTipoActividad,
} from "@/modules/ayudas/domain/TipoActividad";
import { type AyudaDeps, validarMeta } from "./deps";
import { DatosAyudaInvalidosError } from "./errors";

export type CrearAyudaInput = {
  adminId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  tipo: TipoActividad;
  descripcion?: string | null;
  metas: { recursoId: string; cantidadObjetivo: number }[];
};

/**
 * Crea una Ayuda con sus metas iniciales, en estado `RECOLECTANDO`:
 * 1. Normaliza y valida la cabecera (título y sector no vacíos).
 * 2. Exige al menos una meta y rechaza recursos repetidos.
 * 3. Valida cada meta: `cantidadObjetivo > 0` y recurso existente y activo (004).
 * 4. Persiste el `adminId` del creador como dueño inmutable (feature 022).
 *
 * Caso de uso puro: solo depende de contratos de dominio (`AyudaRepository` y
 * `RecursoRepository`). La validación de formato ocurre también en el límite.
 */
export async function crearAyuda(
  { ayudas, recursos }: AyudaDeps,
  input: CrearAyudaInput,
): Promise<Ayuda> {
  const titulo = normalizarTexto(input.titulo);
  const sectorDestino = normalizarTexto(input.sectorDestino);
  const adminId = normalizarTexto(input.adminId);

  if (!adminId) {
    throw new DatosAyudaInvalidosError(
      "La actividad debe tener un administrador dueño.",
    );
  }
  if (!esTituloValido(titulo)) {
    throw new DatosAyudaInvalidosError("El título no puede estar vacío.");
  }
  if (!esSectorValido(sectorDestino)) {
    throw new DatosAyudaInvalidosError(
      "El sector de destino no puede estar vacío.",
    );
  }
  if (!esTipoActividad(input.tipo)) {
    throw new DatosAyudaInvalidosError("El tipo de actividad no es válido.");
  }
  if (input.metas.length === 0) {
    throw new DatosAyudaInvalidosError("Añade al menos una meta de recurso.");
  }
  if (hayRecursosRepetidos(input.metas.map((m) => m.recursoId))) {
    throw new DatosAyudaInvalidosError(
      "No repitas un recurso en dos metas de la misma ayuda.",
    );
  }

  for (const meta of input.metas) {
    await validarMeta(recursos, meta.recursoId, meta.cantidadObjetivo);
  }

  return ayudas.crear({
    adminId,
    titulo,
    sectorDestino,
    fecha: input.fecha,
    tipo: input.tipo,
    descripcion: normalizarDescripcion(input.descripcion),
    metas: input.metas.map((m) => ({
      recursoId: m.recursoId,
      cantidadObjetivo: m.cantidadObjetivo,
    })),
  });
}
