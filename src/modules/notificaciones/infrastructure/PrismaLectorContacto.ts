import { prisma } from "@/lib/prisma";
import type { ContactoDestinatario } from "@/modules/notificaciones/domain/Notificacion";
import type { LectorContacto } from "@/modules/notificaciones/domain/LectorContacto";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Rol as RolType } from "@/modules/usuarios/domain/Rol";

// Resuelve el contacto de los destinatarios (feature 012). Para el ADMIN el
// teléfono y su flag WhatsApp viven en el `PerfilAdmin`; para el resto, en el
// propio `Usuario`.
export class PrismaLectorContacto implements LectorContacto {
  async contactoDe(
    usuarioIds: readonly string[],
  ): Promise<ContactoDestinatario[]> {
    if (usuarioIds.length === 0) return [];
    const filas = await prisma.usuario.findMany({
      where: { id: { in: [...usuarioIds] } },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        telefono: true,
        telefonoEsWhatsApp: true,
        perfilAdmin: {
          select: { telefono: true, telefonoEsWhatsApp: true },
        },
      },
    });

    return filas.map((f) => {
      if (f.rol === Rol.ADMIN && f.perfilAdmin) {
        return {
          usuarioId: f.id,
          nombre: f.nombre,
          email: f.email,
          rol: f.rol as RolType,
          telefono: f.perfilAdmin.telefono || null,
          telefonoEsWhatsApp: f.perfilAdmin.telefonoEsWhatsApp,
        };
      }
      return {
        usuarioId: f.id,
        nombre: f.nombre,
        email: f.email,
        rol: f.rol as RolType,
        telefono: f.telefono,
        telefonoEsWhatsApp: f.telefonoEsWhatsApp,
      };
    });
  }
}
