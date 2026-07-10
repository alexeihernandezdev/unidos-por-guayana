import { prisma } from "@/lib/prisma";
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

// Implementación del repositorio sobre Prisma. Los enums de dominio y los de
// Prisma comparten los mismos valores (misma unión de strings), así que la fila
// es asignable a la entidad de dominio sin conversiones.
export class PrismaRecursoRepository implements RecursoRepository {
  async crear(datos: NuevoRecurso): Promise<Recurso> {
    return prisma.recurso.create({
      data: {
        nombre: datos.nombre,
        unidad: datos.unidad,
        categoria: datos.categoria,
        descripcion: datos.descripcion,
        // Si el caso de uso no especifica el estado (p. ej. tests o
        // rutas legacy), Prisma aplica el default `APROBADO` del schema.
        ...(datos.estadoAprobacion
          ? { estadoAprobacion: datos.estadoAprobacion }
          : {}),
        propuestoPorId: datos.propuestoPorId ?? null,
      },
    });
  }

  async listar(filtro?: FiltroRecursos): Promise<Recurso[]> {
    const where: Record<string, unknown> = {};
    if (filtro?.categoria) where.categoria = filtro.categoria;
    if (filtro?.soloActivos) where.activo = true;
    if (filtro?.estadoAprobacion) {
      where.estadoAprobacion = filtro.estadoAprobacion;
    }
    if (filtro?.soloSeleccionables) {
      where.estadoAprobacion = EstadoAprobacionRecurso.APROBADO;
      where.activo = true;
    }
    return prisma.recurso.findMany({
      where,
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
