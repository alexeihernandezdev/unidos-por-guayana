import { prisma } from "@/lib/prisma";
import type {
  CambiosRecurso,
  NuevoRecurso,
  Recurso,
} from "@/modules/recursos/domain/Recurso";
import type {
  FiltroRecursos,
  RecursoRepository,
} from "@/modules/recursos/domain/RecursoRepository";

// Implementación del repositorio sobre Prisma. Los enums de dominio y los de
// Prisma comparten los mismos valores (misma unión de strings), así que la fila
// es asignable a la entidad de dominio sin conversiones.
export class PrismaRecursoRepository implements RecursoRepository {
  async crear(datos: NuevoRecurso): Promise<Recurso> {
    return prisma.recurso.create({ data: datos });
  }

  async listar(filtro?: FiltroRecursos): Promise<Recurso[]> {
    return prisma.recurso.findMany({
      where: {
        ...(filtro?.categoria ? { categoria: filtro.categoria } : {}),
        ...(filtro?.soloActivos ? { activo: true } : {}),
      },
      orderBy: { nombre: "asc" },
    });
  }

  async buscarPorId(id: string): Promise<Recurso | null> {
    return prisma.recurso.findUnique({ where: { id } });
  }

  async buscarPorNombre(nombre: string): Promise<Recurso | null> {
    // Unicidad insensible a mayúsculas/espacios: se compara el nombre recortado
    // con `mode: "insensitive"` de Postgres.
    return prisma.recurso.findFirst({
      where: { nombre: { equals: nombre.trim(), mode: "insensitive" } },
    });
  }

  async actualizar(id: string, cambios: CambiosRecurso): Promise<Recurso> {
    return prisma.recurso.update({ where: { id }, data: cambios });
  }
}
