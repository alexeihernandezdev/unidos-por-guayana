import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { Afiliacion, MiembroRed } from "./Afiliacion";

// Conteo de colaboradores VERIFICADOS de la red de un ADMIN por cada categoría que
// declaran poder aportar (feature 025). Un colaborador cuenta en cada una de sus
// categorías.
export type ConteoPorCategoria = Record<CategoriaRecurso, number>;

// Contrato de persistencia de afiliaciones. La implementación concreta (Prisma)
// vive en infraestructura; el dominio solo define la interfaz.
export interface AfiliacionRepository {
  // Afilia (idempotente por `@@unique`): si ya existe, devuelve la existente.
  afiliar(colaboradorId: string, adminId: string): Promise<Afiliacion>;
  // Borra el vínculo si existe (remover de la red). No falla si no existe.
  remover(colaboradorId: string, adminId: string): Promise<void>;
  buscar(colaboradorId: string, adminId: string): Promise<Afiliacion | null>;
  // Ids de los ADMIN a los que está afiliado un colaborador (para marcar "ya
  // afiliado" en el descubrimiento y listar sus centros).
  listarAdminIdsDeColaborador(colaboradorId: string): Promise<string[]>;
  // Red del ADMIN: colaboradores afiliados con su contacto y categorías. Filtrable
  // por una categoría declarada.
  listarRed(
    adminId: string,
    filtroCategoria?: CategoriaRecurso,
  ): Promise<MiembroRed[]>;
  // Cuántos colaboradores VERIFICADOS de la red declaran cada categoría.
  contarAptosPorCategoria(adminId: string): Promise<ConteoPorCategoria>;
  // Ids de colaboradores VERIFICADOS de la red cuyas categorías declaradas
  // intersectan `categorias` (destinatarios de la convocatoria, feature 012).
  listarDestinatarios(
    adminId: string,
    categorias: readonly CategoriaRecurso[],
  ): Promise<string[]>;
}
