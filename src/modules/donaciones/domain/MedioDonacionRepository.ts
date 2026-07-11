import type {
  CambiosMedioDonacion,
  MedioDonacion,
  NuevoMedioDonacion,
} from "./MedioDonacion";

// Contrato de persistencia de medios de donación (feature 014). La implementación
// concreta (Prisma) vive en la capa de infraestructura; el dominio solo define la
// interfaz.
export interface MedioDonacionRepository {
  crear(datos: NuevoMedioDonacion): Promise<MedioDonacion>;
  buscarPorId(id: string): Promise<MedioDonacion | null>;
  /** Todos los medios (admin), ordenados por `orden` asc y luego por creación. */
  listar(): Promise<MedioDonacion[]>;
  /** Solo los `activo` (públicos), ordenados por `orden` asc. */
  listarPublicables(): Promise<MedioDonacion[]>;
  actualizar(id: string, cambios: CambiosMedioDonacion): Promise<MedioDonacion>;
  /** Activa o desactiva el medio (nunca se borra). */
  cambiarActivo(id: string, activo: boolean): Promise<MedioDonacion>;
}
