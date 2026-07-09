import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type {
  CambiosRecurso,
  Recurso,
} from "@/modules/recursos/domain/Recurso";
import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import {
  claveNombre,
  esCategoriaRecurso,
  esNombreValido,
  esUnidadValida,
  normalizarNombre,
  normalizarUnidad,
} from "@/modules/recursos/domain/reglas";
import { normalizarDescripcion } from "./crearRecurso";
import {
  DatosRecursoInvalidosError,
  NombreDuplicadoError,
  RecursoNoEncontradoError,
} from "./errors";

export type EditarRecursoDeps = {
  recursos: RecursoRepository;
};

export type EditarRecursoInput = {
  nombre?: string;
  unidad?: string;
  categoria?: CategoriaRecurso;
  descripcion?: string | null;
};

/**
 * Edita un recurso existente. Valida los campos que vengan y, si cambia el nombre,
 * revalida la unicidad (permitiendo que coincida consigo mismo). Solo persiste los
 * campos indicados.
 */
export async function editarRecurso(
  { recursos }: EditarRecursoDeps,
  id: string,
  input: EditarRecursoInput,
): Promise<Recurso> {
  const actual = await recursos.buscarPorId(id);
  if (!actual) {
    throw new RecursoNoEncontradoError(id);
  }

  const cambios: CambiosRecurso = {};

  if (input.nombre !== undefined) {
    const nombre = normalizarNombre(input.nombre);
    if (!esNombreValido(nombre)) {
      throw new DatosRecursoInvalidosError("El nombre no puede estar vacío.");
    }
    if (claveNombre(nombre) !== claveNombre(actual.nombre)) {
      const otro = await recursos.buscarPorNombre(nombre);
      if (otro && otro.id !== id) {
        throw new NombreDuplicadoError(nombre);
      }
    }
    cambios.nombre = nombre;
  }

  if (input.unidad !== undefined) {
    const unidad = normalizarUnidad(input.unidad);
    if (!esUnidadValida(unidad)) {
      throw new DatosRecursoInvalidosError("La unidad no puede estar vacía.");
    }
    cambios.unidad = unidad;
  }

  if (input.categoria !== undefined) {
    if (!esCategoriaRecurso(input.categoria)) {
      throw new DatosRecursoInvalidosError("La categoría no es válida.");
    }
    cambios.categoria = input.categoria;
  }

  if (input.descripcion !== undefined) {
    cambios.descripcion = normalizarDescripcion(input.descripcion);
  }

  return recursos.actualizar(id, cambios);
}
