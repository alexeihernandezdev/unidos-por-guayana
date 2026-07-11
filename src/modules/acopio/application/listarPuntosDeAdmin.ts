import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import type {
  FiltroPuntosAcopio,
  PuntoAcopioRepository,
} from "@/modules/acopio/domain/PuntoAcopioRepository";

export type ListarPuntosDeAdminDeps = {
  puntos: PuntoAcopioRepository;
};

/**
 * Lista los puntos de acopio del `ADMIN` dueño. La propiedad se enforce en el
 * repo: no hay listado global. `filtro.activo`:
 *   - `true`  → solo activos
 *   - `false` → solo archivados
 *   - `undefined` → todos
 */
export async function listarPuntosDeAdmin(
  { puntos }: ListarPuntosDeAdminDeps,
  adminId: string,
  filtro?: FiltroPuntosAcopio,
): Promise<PuntoAcopio[]> {
  return puntos.listarPorAdmin(adminId, filtro);
}
