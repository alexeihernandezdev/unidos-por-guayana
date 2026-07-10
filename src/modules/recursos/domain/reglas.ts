import { esCategoriaRecurso } from "./CategoriaRecurso";
import { EstadoAprobacionRecurso } from "./EstadoAprobacionRecurso";
import type { Recurso } from "./Recurso";

// Reglas de dominio puras del catálogo de recursos. Sin framework ni Prisma.

/** Normaliza un nombre de recurso: recorta espacios de los extremos. */
export function normalizarNombre(nombre: string): string {
  return nombre.trim();
}

/** Normaliza una unidad de medida: recorta espacios de los extremos. */
export function normalizarUnidad(unidad: string): string {
  return unidad.trim();
}

// Clave de comparación insensible a mayúsculas/espacios para la unicidad de
// nombre. La restricción `@unique` de Postgres es sensible a mayúsculas, así que
// la unicidad "real" (Agua == agua) la garantiza la aplicación con esta clave.
export function claveNombre(nombre: string): string {
  return normalizarNombre(nombre).toLowerCase();
}

export function esNombreValido(nombre: string): boolean {
  return normalizarNombre(nombre).length > 0;
}

export function esUnidadValida(unidad: string): boolean {
  return normalizarUnidad(unidad).length > 0;
}

export { esCategoriaRecurso };

/**
 * Un recurso es seleccionable en metas (005) y aportes (006) si está aprobado y
 * no está archivado. `estadoAprobacion` y `activo` son ejes independientes: un
 * `PROPUESTO` no aparece aunque tenga `activo = true`, y un `APROBADO` archivado
 * tampoco.
 */
export function esSeleccionable(
  recurso: Pick<Recurso, "estadoAprobacion" | "activo">,
): boolean {
  return (
    recurso.estadoAprobacion === EstadoAprobacionRecurso.APROBADO &&
    recurso.activo
  );
}
