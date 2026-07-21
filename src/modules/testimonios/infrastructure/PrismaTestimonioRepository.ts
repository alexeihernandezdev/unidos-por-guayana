import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Rol } from "@/modules/usuarios/domain/Rol";
import {
  EstadoTestimonio,
  type CambiosTestimonio,
  type FiltroTestimonios,
  type NuevoTestimonio,
  type Testimonio,
  type TestimonioRepository,
} from "../domain";

const INCLUDE = {
  autor: {
    include: {
      estadoUbicacion: true,
      municipioUbicacion: true,
    },
  },
  solicitud: { select: { id: true, sector: true } },
} as const;

type Fila = Prisma.TestimonioGetPayload<{ include: typeof INCLUDE }>;

function mapear(fila: Fila): Testimonio {
  return {
    id: fila.id,
    autorId: fila.autorId,
    autor: {
      id: fila.autor.id,
      nombre: fila.autor.nombre,
      rol: fila.autor.rol as Rol,
      estado: fila.autor.estadoUbicacion?.nombre ?? null,
      municipio: fila.autor.municipioUbicacion?.nombre ?? null,
    },
    solicitudId: fila.solicitudId,
    solicitud: fila.solicitud,
    titulo: fila.titulo,
    contenido: fila.contenido,
    estado: fila.estado as EstadoTestimonio,
    motivoRechazo: fila.motivoRechazo,
    destacado: fila.destacado,
    moderadoPorId: fila.moderadoPorId,
    moderadoEn: fila.moderadoEn,
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
  };
}

function whereDe(filtro?: FiltroTestimonios): Prisma.TestimonioWhereInput {
  return {
    ...(filtro?.estado ? { estado: filtro.estado } : {}),
    ...(filtro?.destacados !== undefined
      ? { destacado: filtro.destacados }
      : {}),
    ...(filtro?.autorId ? { autorId: filtro.autorId } : {}),
    ...(filtro?.texto
      ? {
          OR: [
            { titulo: { contains: filtro.texto, mode: "insensitive" } },
            { contenido: { contains: filtro.texto, mode: "insensitive" } },
            {
              autor: {
                nombre: { contains: filtro.texto, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };
}

export class PrismaTestimonioRepository implements TestimonioRepository {
  async crear(datos: NuevoTestimonio): Promise<Testimonio> {
    const fila = await prisma.testimonio.create({
      data: datos,
      include: INCLUDE,
    });
    return mapear(fila);
  }

  async buscarPorId(id: string): Promise<Testimonio | null> {
    const fila = await prisma.testimonio.findUnique({
      where: { id },
      include: INCLUDE,
    });
    return fila ? mapear(fila) : null;
  }

  async listar(filtro?: FiltroTestimonios): Promise<Testimonio[]> {
    const filas = await prisma.testimonio.findMany({
      where: whereDe(filtro),
      include: INCLUDE,
      orderBy: [{ destacado: "desc" }, { createdAt: "desc" }],
      skip: filtro?.skip,
      take: filtro?.take,
    });
    return filas.map(mapear);
  }

  contar(filtro?: FiltroTestimonios): Promise<number> {
    return prisma.testimonio.count({ where: whereDe(filtro) });
  }

  async editar(id: string, cambios: CambiosTestimonio): Promise<Testimonio> {
    const fila = await prisma.testimonio.update({
      where: { id },
      data: {
        ...cambios,
        estado: EstadoTestimonio.PENDIENTE,
        motivoRechazo: null,
        destacado: false,
        moderadoPorId: null,
        moderadoEn: null,
      },
      include: INCLUDE,
    });
    return mapear(fila);
  }

  async moderar(
    id: string,
    estado: EstadoTestimonio,
    moderadoPorId: string,
    motivoRechazo: string | null = null,
  ): Promise<Testimonio> {
    const fila = await prisma.testimonio.update({
      where: { id },
      data: {
        estado,
        motivoRechazo,
        moderadoPorId,
        moderadoEn: new Date(),
        destacado: false,
      },
      include: INCLUDE,
    });
    return mapear(fila);
  }

  async retirar(id: string): Promise<Testimonio> {
    const fila = await prisma.testimonio.update({
      where: { id },
      data: { estado: EstadoTestimonio.OCULTO, destacado: false },
      include: INCLUDE,
    });
    return mapear(fila);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.testimonio.delete({ where: { id } });
  }

  async destacarSiHayCupo(
    id: string,
    limite: number,
  ): Promise<Testimonio | null> {
    return prisma.$transaction(
      async (tx) => {
        const actual = await tx.testimonio.findUnique({ where: { id } });
        if (!actual || actual.estado !== EstadoTestimonio.APROBADO) return null;
        if (actual.destacado) {
          const fila = await tx.testimonio.findUnique({
            where: { id },
            include: INCLUDE,
          });
          return fila ? mapear(fila) : null;
        }
        const cantidad = await tx.testimonio.count({
          where: { estado: EstadoTestimonio.APROBADO, destacado: true },
        });
        if (cantidad >= limite) return null;
        const fila = await tx.testimonio.update({
          where: { id },
          data: { destacado: true },
          include: INCLUDE,
        });
        return mapear(fila);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async quitarDestacado(id: string): Promise<Testimonio> {
    const fila = await prisma.testimonio.update({
      where: { id },
      data: { destacado: false },
      include: INCLUDE,
    });
    return mapear(fila);
  }
}
