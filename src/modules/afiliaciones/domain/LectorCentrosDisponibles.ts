import type { CentroDisponible } from "./Afiliacion";

// Filtro de descubrimiento de centros: por ubicación del catálogo (feature 020).
export type FiltroCentros = {
  estadoId?: string;
  municipioId?: string;
};

// Puerto de lectura de los centros de acopio disponibles para afiliarse: cuentas
// ADMIN VERIFICADO con su `PerfilAdmin` y sus `PuntoAcopio` activos (feature 025).
// La implementación concreta (Prisma) vive en infraestructura.
export interface LectorCentrosDisponibles {
  listar(filtro?: FiltroCentros): Promise<CentroDisponible[]>;
}
