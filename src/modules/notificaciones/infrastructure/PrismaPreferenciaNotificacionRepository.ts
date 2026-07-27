import { prisma } from "@/lib/prisma";
import type {
  CanalExterno,
  PreferenciaNotificacion,
  PreferenciaNotificacionRepository,
} from "@/modules/notificaciones/domain";
import type { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";

export class PrismaPreferenciaNotificacionRepository
  implements PreferenciaNotificacionRepository
{
  async listarPorUsuario(usuarioId: string): Promise<PreferenciaNotificacion[]> {
    const filas = await prisma.preferenciaNotificacion.findMany({
      where: { usuarioId },
    });
    return filas.map((fila) => ({
      usuarioId: fila.usuarioId,
      tipo: fila.tipo as TipoNotificacion,
      emailActivo: fila.emailActivo,
      whatsappActivo: fila.whatsappActivo,
    }));
  }

  async listarPorUsuarios(
    usuarioIds: readonly string[],
  ): Promise<PreferenciaNotificacion[]> {
    if (usuarioIds.length === 0) return [];
    const filas = await prisma.preferenciaNotificacion.findMany({
      where: { usuarioId: { in: [...usuarioIds] } },
    });
    return filas.map((fila) => ({
      usuarioId: fila.usuarioId,
      tipo: fila.tipo as TipoNotificacion,
      emailActivo: fila.emailActivo,
      whatsappActivo: fila.whatsappActivo,
    }));
  }

  async guardar(
    usuarioId: string,
    tipo: TipoNotificacion,
    canal: CanalExterno,
    activo: boolean,
  ): Promise<void> {
    const campo =
      canal === "EMAIL"
        ? { emailActivo: activo }
        : { whatsappActivo: activo };
    await prisma.preferenciaNotificacion.upsert({
      where: { usuarioId_tipo: { usuarioId, tipo } },
      create: { usuarioId, tipo, ...campo },
      update: campo,
    });
  }
}
