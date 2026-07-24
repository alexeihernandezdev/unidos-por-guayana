import { prisma } from "@/lib/prisma";
import type {
  Notificacion,
  NuevaNotificacion,
} from "@/modules/notificaciones/domain/Notificacion";
import type {
  FiltroNotificaciones,
  NotificacionRepository,
} from "@/modules/notificaciones/domain/NotificacionRepository";
import type { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";

// Implementación del repositorio de notificaciones sobre Prisma (feature 012). Los
// enums de dominio y de Prisma comparten valores, así que el mapeo es directo.
export class PrismaNotificacionRepository implements NotificacionRepository {
  async crearMuchas(nuevas: readonly NuevaNotificacion[]): Promise<void> {
    if (nuevas.length === 0) return;
    await prisma.notificacion.createMany({
      data: nuevas.map((n) => ({
        usuarioId: n.usuarioId,
        tipo: n.tipo,
        mensaje: n.mensaje,
        referenciaTipo: n.referenciaTipo,
        referenciaId: n.referenciaId,
        claveDedupe: n.claveDedupe,
      })),
      skipDuplicates: true,
    });
  }

  async usuariosConClave(claveDedupe: string): Promise<string[]> {
    const filas = await prisma.notificacion.findMany({
      where: { claveDedupe },
      select: { usuarioId: true },
    });
    return filas.map((f) => f.usuarioId);
  }

  async listarPorUsuario(
    usuarioId: string,
    filtro?: FiltroNotificaciones,
  ): Promise<Notificacion[]> {
    const filas = await prisma.notificacion.findMany({
      where: {
        usuarioId,
        ...(filtro?.soloNoLeidas ? { leida: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      ...(filtro?.limite != null ? { take: filtro.limite } : {}),
    });
    return filas.map((f) => ({
      id: f.id,
      usuarioId: f.usuarioId,
      tipo: f.tipo as TipoNotificacion,
      mensaje: f.mensaje,
      referenciaTipo: f.referenciaTipo,
      referenciaId: f.referenciaId,
      leida: f.leida,
      claveDedupe: f.claveDedupe,
      createdAt: f.createdAt,
    }));
  }

  async contarNoLeidas(usuarioId: string): Promise<number> {
    return prisma.notificacion.count({
      where: { usuarioId, leida: false },
    });
  }

  async marcarLeida(id: string, usuarioId: string): Promise<boolean> {
    // `updateMany` filtrando por dueño: idempotente y seguro (nadie marca lo ajeno).
    const { count } = await prisma.notificacion.updateMany({
      where: { id, usuarioId },
      data: { leida: true },
    });
    return count > 0;
  }

  async marcarTodasLeidas(usuarioId: string): Promise<void> {
    await prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
  }
}
