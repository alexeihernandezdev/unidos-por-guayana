import { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";
import type {
  CambiosRecurso,
  NuevoRecurso,
  Recurso,
} from "@/modules/recursos/domain/Recurso";
import type {
  FiltroRecursos,
  RecursoRepository,
} from "@/modules/recursos/domain/RecursoRepository";
import { claveNombre } from "@/modules/recursos/domain/reglas";
import { RecursoNoEncontradoError } from "./errors";

// Doble en memoria para los tests de casos de uso. No toca la base ni Prisma.
// La búsqueda por nombre replica la unicidad insensible a mayúsculas/espacios de
// la aplicación (claveNombre), como haría el `mode: "insensitive"` de Prisma.
export class InMemoryRecursoRepository implements RecursoRepository {
  private readonly porId = new Map<string, Recurso>();
  private secuencia = 0;

  async crear(datos: NuevoRecurso): Promise<Recurso> {
    const ahora = new Date();
    const recurso: Recurso = {
      id: `recurso-${++this.secuencia}`,
      nombre: datos.nombre,
      unidad: datos.unidad,
      categoria: datos.categoria,
      descripcion: datos.descripcion,
      activo: true,
      estadoAprobacion:
        datos.estadoAprobacion ?? EstadoAprobacionRecurso.APROBADO,
      propuestoPorId: datos.propuestoPorId ?? null,
      createdAt: ahora,
      updatedAt: ahora,
    };
    this.porId.set(recurso.id, recurso);
    return recurso;
  }

  async listar(filtro?: FiltroRecursos): Promise<Recurso[]> {
    let recursos = [...this.porId.values()];
    if (filtro?.categoria) {
      recursos = recursos.filter((r) => r.categoria === filtro.categoria);
    }
    if (filtro?.soloActivos) {
      recursos = recursos.filter((r) => r.activo);
    }
    if (filtro?.estadoAprobacion) {
      recursos = recursos.filter(
        (r) => r.estadoAprobacion === filtro.estadoAprobacion,
      );
    }
    if (filtro?.soloSeleccionables) {
      recursos = recursos.filter(
        (r) =>
          r.estadoAprobacion === EstadoAprobacionRecurso.APROBADO && r.activo,
      );
    }
    return recursos;
  }

  async buscarPorId(id: string): Promise<Recurso | null> {
    return this.porId.get(id) ?? null;
  }

  async buscarPorNombre(nombre: string): Promise<Recurso | null> {
    const clave = claveNombre(nombre);
    for (const recurso of this.porId.values()) {
      if (claveNombre(recurso.nombre) === clave) return recurso;
    }
    return null;
  }

  async actualizar(id: string, cambios: CambiosRecurso): Promise<Recurso> {
    const actual = this.porId.get(id);
    if (!actual) throw new RecursoNoEncontradoError(id);
    const actualizado: Recurso = {
      ...actual,
      ...cambios,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return actualizado;
  }
}
