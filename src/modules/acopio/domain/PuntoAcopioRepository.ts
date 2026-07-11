import type {
  CambiosPuntoAcopio,
  NuevoPuntoAcopio,
  PuntoAcopio,
} from "./PuntoAcopio";

// Filtro del listado. `activo`:
//   - `true` → solo activos
//   - `false` → solo archivados
//   - `undefined` → todos
export type FiltroPuntosAcopio = {
  activo?: boolean;
};

// Contrato de persistencia. La implementación concreta (Prisma) vive en la capa
// de infraestructura; el dominio solo define la interfaz. Todas las consultas
// filtran por `adminId` (propiedad) en el nivel del repo — no hay `listarTodos`.
export interface PuntoAcopioRepository {
  crear(datos: NuevoPuntoAcopio): Promise<PuntoAcopio>;
  listarPorAdmin(
    adminId: string,
    filtro?: FiltroPuntosAcopio,
  ): Promise<PuntoAcopio[]>;
  buscarPorId(id: string): Promise<PuntoAcopio | null>;
  actualizar(id: string, cambios: CambiosPuntoAcopio): Promise<PuntoAcopio>;
  cambiarActivo(id: string, activo: boolean): Promise<PuntoAcopio>;
}
