import { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";
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
import { normalizarDescripcion } from "./crearRecurso";
import { DatosRecursoInvalidosError, NombreDuplicadoError } from "./errors";

export type ProponerRecursoDeps = {
  recursos: RecursoRepository;
};

export type ProponerRecursoInput = {
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion?: string | null;
};

/**
 * Un SOLICITANTE propone un nuevo recurso al catálogo (feature 019). Aplica las
 * mismas validaciones que `crearRecurso` (formato, unicidad insensible a
 * mayúsculas) pero fija el estado inicial en `PROPUESTO` y guarda quién lo
 * propuso. No queda seleccionable en metas ni aportes hasta que un ADMIN lo
 * apruebe.
 */
export async function proponerRecurso(
  { recursos }: ProponerRecursoDeps,
  input: ProponerRecursoInput,
  solicitanteId: string,
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
    estadoAprobacion: EstadoAprobacionRecurso.PROPUESTO,
    propuestoPorId: solicitanteId,
  });
}
