import type { EstadoVerificacion } from "./Rol";
import type { NuevoUsuario, Usuario } from "./Usuario";

// Contrato de persistencia de usuarios. La implementación concreta (Prisma) vive
// en la capa de infraestructura; el dominio solo define la interfaz.
export interface UsuarioRepository {
  crear(datos: NuevoUsuario): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  // Cuentas `ADMIN` en `PENDIENTE`, para la bandeja del superadmin (feature 015).
  listarAdminsPendientes(): Promise<Usuario[]>;
  actualizarEstadoVerificacion(
    id: string,
    estado: EstadoVerificacion,
  ): Promise<Usuario>;
}
