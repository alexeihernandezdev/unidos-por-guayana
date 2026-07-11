import { prisma } from "@/lib/prisma";
import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { CATEGORIAS_RECURSO } from "@/modules/recursos/domain/CategoriaRecurso";
import type { EstadoVerificacion } from "@/modules/usuarios/domain/Rol";
import type { Afiliacion, MiembroRed } from "@/modules/afiliaciones/domain/Afiliacion";
import type {
  AfiliacionRepository,
  ConteoPorCategoria,
} from "@/modules/afiliaciones/domain/AfiliacionRepository";

// Fila de colaborador tal como se lee para la red (estructural, sin acoplar a los
// tipos generados).
type FilaColaborador = {
  id: string;
  nombre: string;
  categoriasAporte: CategoriaRecurso[];
  estadoVerificacion: EstadoVerificacion;
  telefono: string | null;
  telefonoEsWhatsApp: boolean;
};

export class PrismaAfiliacionRepository implements AfiliacionRepository {
  async afiliar(colaboradorId: string, adminId: string): Promise<Afiliacion> {
    return prisma.afiliacion.upsert({
      where: { colaboradorId_adminId: { colaboradorId, adminId } },
      create: { colaboradorId, adminId },
      update: {},
    });
  }

  async remover(colaboradorId: string, adminId: string): Promise<void> {
    await prisma.afiliacion.deleteMany({ where: { colaboradorId, adminId } });
  }

  async buscar(
    colaboradorId: string,
    adminId: string,
  ): Promise<Afiliacion | null> {
    return prisma.afiliacion.findUnique({
      where: { colaboradorId_adminId: { colaboradorId, adminId } },
    });
  }

  async listarAdminIdsDeColaborador(colaboradorId: string): Promise<string[]> {
    const filas = await prisma.afiliacion.findMany({
      where: { colaboradorId },
      select: { adminId: true },
    });
    return filas.map((f) => f.adminId);
  }

  async listarRed(
    adminId: string,
    filtroCategoria?: CategoriaRecurso,
  ): Promise<MiembroRed[]> {
    const filas = await prisma.afiliacion.findMany({
      where: {
        adminId,
        ...(filtroCategoria
          ? { colaborador: { categoriasAporte: { has: filtroCategoria } } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        colaborador: {
          select: {
            id: true,
            nombre: true,
            categoriasAporte: true,
            estadoVerificacion: true,
            telefono: true,
            telefonoEsWhatsApp: true,
          },
        },
      },
    });
    return filas.map((f) => {
      const c = f.colaborador as FilaColaborador;
      return {
        colaboradorId: c.id,
        nombre: c.nombre,
        categorias: c.categoriasAporte,
        estadoVerificacion: c.estadoVerificacion,
        telefono: c.telefono,
        telefonoEsWhatsApp: c.telefonoEsWhatsApp,
        afiliadoEn: f.createdAt,
      } satisfies MiembroRed;
    });
  }

  async contarAptosPorCategoria(adminId: string): Promise<ConteoPorCategoria> {
    const filas = await prisma.afiliacion.findMany({
      where: { adminId, colaborador: { estadoVerificacion: "VERIFICADO" } },
      select: { colaborador: { select: { categoriasAporte: true } } },
    });
    const conteo = CATEGORIAS_RECURSO.reduce((acc, categoria) => {
      acc[categoria] = 0;
      return acc;
    }, {} as ConteoPorCategoria);
    for (const fila of filas) {
      for (const categoria of fila.colaborador.categoriasAporte) {
        conteo[categoria as CategoriaRecurso]++;
      }
    }
    return conteo;
  }

  async listarDestinatarios(
    adminId: string,
    categorias: readonly CategoriaRecurso[],
  ): Promise<string[]> {
    if (categorias.length === 0) return [];
    const filas = await prisma.afiliacion.findMany({
      where: {
        adminId,
        colaborador: {
          estadoVerificacion: "VERIFICADO",
          categoriasAporte: { hasSome: [...categorias] },
        },
      },
      select: { colaboradorId: true },
    });
    return filas.map((f) => f.colaboradorId);
  }
}
