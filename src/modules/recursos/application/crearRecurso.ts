import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import {
  esCategoriaRecurso,
  esNombreValido,
  esUnidadValida,
  normalizarNombre,
  normalizarUnidad,
} from "@/modules/recursos/domain/reglas";
import { DatosRecursoInvalidosError, NombreDuplicadoError } from "./errors";

export type CrearRecursoDeps = {
  recursos: RecursoRepository;
};

export type CrearRecursoInput = {
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion?: string | null;
};

/**
 * Da de alta un recurso del catálogo:
 * 1. Normaliza nombre/unidad y valida que no estén vacíos y la categoría sea válida.
 * 2. Rechaza un nombre duplicado (comparación insensible a mayúsculas/espacios).
 * 3. Crea el recurso (se guarda el nombre "tal cual" con trim).
 *
 * Caso de uso puro: solo depende del dominio. La validación del formato de entrada
 * ocurre también en el límite (servidor); aquí se aplican las reglas de negocio.
 */
export async function crearRecurso(
  { recursos }: CrearRecursoDeps,
  input: CrearRecursoInput,
): Promise<Recurso> {
  const nombre = normalizarNombre(input.nombre);
  const unidad = normalizarUnidad(input.unidad);

  if (!esNombreValido(nombre)) {
    throw new DatosRecursoInvalidosError("El nombre no puede estar vacío.");
  }
  if (!esUnidadValida(unidad)) {
    throw new DatosRecursoInvalidosError("La unidad no puede estar vacía.");
  }
  if (!esCategoriaRecurso(input.categoria)) {
    throw new DatosRecursoInvalidosError("La categoría no es válida.");
  }

  const existente = await recursos.buscarPorNombre(nombre);
  if (existente) {
    throw new NombreDuplicadoError(nombre);
  }

  return recursos.crear({
    nombre,
    unidad,
    categoria: input.categoria,
    descripcion: normalizarDescripcion(input.descripcion),
  });
}

// Descripción opcional: recorta y convierte "" en null para no guardar vacíos.
export function normalizarDescripcion(
  descripcion?: string | null,
): string | null {
  const limpia = descripcion?.trim();
  return limpia ? limpia : null;
}
