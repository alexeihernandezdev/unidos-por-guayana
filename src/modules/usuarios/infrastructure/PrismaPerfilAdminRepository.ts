import { prisma } from "@/lib/prisma";
import type {
  CambiosPerfilAdmin,
  NuevoPerfilAdmin,
  PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import type { PerfilAdminRepository } from "@/modules/usuarios/domain/PerfilAdminRepository";

function mapearPerfil(
  row: Awaited<ReturnType<typeof prisma.perfilAdmin.findUnique>> & {
    estadoUbicacion?: { nombre: string } | null;
    municipio?: { nombre: string } | null;
  },
): PerfilAdmin {
  if (!row) {
    throw new Error("Perfil no encontrado.");
  }
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    nombreCuenta: row.nombreCuenta,
    estadoId: row.estadoId,
    municipioId: row.municipioId,
    telefono: row.telefono,
    telefonoEsWhatsApp: row.telefonoEsWhatsApp,
    correo: row.correo,
    tipoDocumento: row.tipoDocumento,
    numeroDocumento: row.numeroDocumento,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    estadoNombre: row.estadoUbicacion?.nombre,
    municipioNombre: row.municipio?.nombre,
  };
}

export class PrismaPerfilAdminRepository implements PerfilAdminRepository {
  async crear(datos: NuevoPerfilAdmin): Promise<PerfilAdmin> {
    const row = await prisma.perfilAdmin.create({
      data: datos,
      include: { estadoUbicacion: true, municipio: true },
    });
    return mapearPerfil(row);
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<PerfilAdmin | null> {
    const row = await prisma.perfilAdmin.findUnique({
      where: { usuarioId },
      include: { estadoUbicacion: true, municipio: true },
    });
    return row ? mapearPerfil(row) : null;
  }

  async actualizar(
    usuarioId: string,
    cambios: CambiosPerfilAdmin,
  ): Promise<PerfilAdmin> {
    const row = await prisma.perfilAdmin.update({
      where: { usuarioId },
      data: cambios,
      include: { estadoUbicacion: true, municipio: true },
    });
    return mapearPerfil(row);
  }
}
