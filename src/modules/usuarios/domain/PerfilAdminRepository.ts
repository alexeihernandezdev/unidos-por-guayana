import type {
  CambiosPerfilAdmin,
  NuevoPerfilAdmin,
  PerfilAdmin,
} from "./PerfilAdmin";

// Contrato de persistencia del perfil de administrador (feature 016). La
// implementación concreta (Prisma) vive en infraestructura; el dominio solo
// define la interfaz.
export interface PerfilAdminRepository {
  crear(datos: NuevoPerfilAdmin): Promise<PerfilAdmin>;
  buscarPorUsuarioId(usuarioId: string): Promise<PerfilAdmin | null>;
  actualizar(
    usuarioId: string,
    cambios: CambiosPerfilAdmin,
  ): Promise<PerfilAdmin>;
}
