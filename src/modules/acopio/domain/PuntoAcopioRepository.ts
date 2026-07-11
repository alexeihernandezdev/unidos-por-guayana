import type {
  CambiosPuntoAcopio,
  NuevoPuntoAcopio,
  PuntoAcopio,
} from "./PuntoAcopio";

// Filtro del listado de gestión (admin dueño). `activo`:
//   - `true` → solo activos
//   - `false` → solo archivados
//   - `undefined` → todos
export type FiltroPuntosAcopio = {
  activo?: boolean;
};

// Filtro del listado de red (colaborador): solo puntos activos, acotables por
// ubicación del catálogo (feature 020).
export type FiltroPuntosActivos = {
  estadoId?: string;
  municipioId?: string;
};

// Contrato de persistencia. La implementación concreta (Prisma) vive en la capa
// de infraestructura; el dominio solo define la interfaz. La gestión filtra por
// `adminId` (propiedad); `listarActivos` es la vista de red del colaborador y
// nunca devuelve archivados.
export interface PuntoAcopioRepository {
  crear(datos: NuevoPuntoAcopio): Promise<PuntoAcopio>;
  listarPorAdmin(
    adminId: string,
    filtro?: FiltroPuntosAcopio,
  ): Promise<PuntoAcopio[]>;
  listarActivos(filtro?: FiltroPuntosActivos): Promise<PuntoAcopio[]>;
  buscarPorId(id: string): Promise<PuntoAcopio | null>;
  actualizar(id: string, cambios: CambiosPuntoAcopio): Promise<PuntoAcopio>;
  cambiarActivo(id: string, activo: boolean): Promise<PuntoAcopio>;
}
