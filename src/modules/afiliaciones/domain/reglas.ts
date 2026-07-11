import {
  CategoriaRecurso,
  esCategoriaRecurso,
} from "@/modules/recursos/domain/CategoriaRecurso";
import type { Afiliacion } from "./Afiliacion";

// Reglas de dominio puras de la afiliación y las categorías de aporte (feature 025).

/**
 * Normaliza una lista de categorías declaradas: descarta valores no válidos y
 * elimina duplicados, conservando el orden canónico del enum. No decide si está
 * vacía (eso lo comprueba `categoriasNoVacias`); solo limpia.
 */
export function normalizarCategorias(
  entrada: readonly string[],
): CategoriaRecurso[] {
  const validas = entrada.filter((c): c is CategoriaRecurso =>
    esCategoriaRecurso(c),
  );
  const unicas = new Set<CategoriaRecurso>(validas);
  // Orden canónico (el del enum) para una salida estable.
  return Object.values(CategoriaRecurso).filter((c) => unicas.has(c));
}

/** ¿La lista de categorías tiene al menos una? (requisito del COLABORADOR). */
export function categoriasNoVacias(cats: readonly CategoriaRecurso[]): boolean {
  return cats.length > 0;
}

/**
 * ¿Se solapan dos conjuntos de categorías? Base de la convocatoria (012) y del
 * conteo de aptos: un colaborador es apto para una actividad si alguna de sus
 * categorías coincide con la de algún recurso de la actividad.
 */
export function intersectanCategorias(
  a: readonly CategoriaRecurso[],
  b: readonly CategoriaRecurso[],
): boolean {
  const conjunto = new Set<CategoriaRecurso>(a);
  return b.some((c) => conjunto.has(c));
}

/**
 * ¿La afiliación pertenece a la red del `adminId`? Propiedad para remover: un ADMIN
 * solo puede sacar de su propia red (no de la de otro).
 */
export function perteneceARed(
  afiliacion: Pick<Afiliacion, "adminId">,
  adminId: string,
): boolean {
  return afiliacion.adminId === adminId;
}
