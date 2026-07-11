import type { Aporte, NuevoAporte } from "./Aporte";
import type { EstadoAporte } from "./EstadoAporte";

// Filtros de listado.
export type FiltroAportes = {
  estado?: EstadoAporte;
  ayudaId?: string;
};

// Agregado por meta (recibido / prometido) que la infraestructura sabe calcular
// eficientemente con `groupBy` (índice por `(ayudaId, recursoId, estado)`).
export type AgregadoPorMeta = {
  recursoId: string;
  recibido: number;
  prometido: number;
};

/** Suma global de aportes RECIBIDO por recurso (tablero público, feature 009). */
export type RecolectadoPorRecursoId = {
  recursoId: string;
  cantidadRecibida: number;
};

/**
 * Lectura de reconocimiento por actividad (feature 023): solo el nombre del
 * aportante, nunca cédula/teléfono/correo/ubicación. La infraestructura debe
 * proyectar con `select` explícito; no devolver el `Usuario` completo.
 */
export type AportanteDeAyuda = {
  id: string;
  aportanteNombre: string;
  recursoNombre: string;
  recursoUnidad: string;
  cantidad: number;
  estado: EstadoAporte;
  fecha: Date;
};

// Contrato de persistencia de aportes. La implementación concreta (Prisma) vive
// en la capa de infraestructura; el dominio solo define la interfaz.
export interface AporteRepository {
  crear(datos: NuevoAporte): Promise<Aporte>;
  buscarPorId(id: string): Promise<Aporte | null>;
  listarPorAyuda(ayudaId: string, filtro?: FiltroAportes): Promise<Aporte[]>;
  listarDeColaborador(colaboradorId: string): Promise<Aporte[]>;
  /**
   * Registro de aportantes de una actividad (feature 023): orden `createdAt`
   * desc, sin datos de contacto del aportante.
   */
  listarAportantesDeAyuda(ayudaId: string): Promise<AportanteDeAyuda[]>;
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
  /** Suma de cantidades RECIBIDO agrupada por recurso en toda la plataforma. */
  recolectadoGlobalPorRecurso(): Promise<RecolectadoPorRecursoId[]>;
  /**
   * Ingresos monetarios externos imputados por un ADMIN (feature 014): aportes con
   * `registradoPorId` no nulo, del más reciente al más antiguo. Incluye el detalle
   * de recurso y medio para la tabla del panel.
   */
  listarIngresosExternos(): Promise<Aporte[]>;
  /** Cuenta aportes que coinciden con el filtro. */
  contar(filtro?: FiltroAportes): Promise<number>;
  /**
   * Últimos aportes de la plataforma, en orden descendente por `createdAt`.
   * Alimenta el feed del dashboard del ADMIN (feature 008).
   */
  listarRecientes(limit: number): Promise<Aporte[]>;
}
