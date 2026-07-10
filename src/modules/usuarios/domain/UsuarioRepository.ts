import type { DatosContacto } from "./datosContacto";
import type { EstadoVerificacion } from "./Rol";
import type { NuevoUsuario, Usuario } from "./Usuario";

// Contrato de persistencia de usuarios. La implementación concreta (Prisma) vive
// en la capa de infraestructura; el dominio solo define la interfaz.
export interface UsuarioRepository {
  crear(datos: NuevoUsuario): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  // Cédula ya normalizada (`V12345678`). Devuelve `null` si nadie la tiene.
  // Feature 017: unicidad de cédula al registrar o editar datos de contacto.
  buscarPorCedula(cedula: string): Promise<Usuario | null>;
  // Cuentas `ADMIN` en `PENDIENTE`, para la bandeja del superadmin (feature 015).
  listarAdminsPendientes(): Promise<Usuario[]>;
  actualizarEstadoVerificacion(
    id: string,
    estado: EstadoVerificacion,
  ): Promise<Usuario>;
  // Feature 017: persiste los cinco campos de contacto y ubicación del
  // usuario. Se usa tanto en el primer login (`/completar-perfil`) como en la
  // edición desde `/mi-perfil`.
  actualizarDatosContacto(id: string, datos: DatosContacto): Promise<Usuario>;
}
