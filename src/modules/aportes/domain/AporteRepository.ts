import type { Aporte, NuevoAporte } from "./Aporte";
import type { EstadoAporte } from "./EstadoAporte";

// Filtros de listado.
export type FiltroAportes = {
  estado?: EstadoAporte;
};

// Agregado por meta (recibido / prometido) que la infraestructura sabe calcular
// eficientemente con `groupBy` (índice por `(ayudaId, recursoId, estado)`).
export type AgregadoPorMeta = {
  recursoId: string;
  recibido: number;
  prometido: number;
};

// Contrato de persistencia de aportes. La implementación concreta (Prisma) vive
// en la capa de infraestructura; el dominio solo define la interfaz.
export interface AporteRepository {
  crear(datos: NuevoAporte): Promise<Aporte>;
  buscarPorId(id: string): Promise<Aporte | null>;
  listarPorAyuda(ayudaId: string, filtro?: FiltroAportes): Promise<Aporte[]>;
  listarDeColaborador(colaboradorId: string): Promise<Aporte[]>;
  /**
   * Transiciona el estado de un aporte de forma idempotente: solo cambia si el
   * estado actual coincide con `desde`. Devuelve el aporte actualizado o `null`
   * si no matcheó (otro proceso ya lo cambió).
   */
  cambiarEstado(
    id: string,
    desde: EstadoAporte,
    hacia: EstadoAporte,
  ): Promise<Aporte | null>;
  eliminar(id: string): Promise<void>;
  /** Agregación por meta de una Ayuda (recibido/prometido por recurso). */
  progresoPorAyuda(ayudaId: string): Promise<AgregadoPorMeta[]>;
}
