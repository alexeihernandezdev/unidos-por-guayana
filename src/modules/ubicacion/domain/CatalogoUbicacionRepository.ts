import type { Estado } from "./Estado";
import type { Municipio } from "./Municipio";

// Puerto de lectura del catálogo de ubicación (feature 020). El dominio define la
// interfaz; la implementación concreta (Prisma) vive en infraestructura. Permite
// que `validarUbicacion` (dominio) y los casos de uso consulten el catálogo sin
// acoplarse a Prisma.
export interface CatalogoUbicacionRepository {
  buscarEstado(id: string): Promise<Estado | null>;
  buscarMunicipio(id: string): Promise<Municipio | null>;
  listarEstados(): Promise<Estado[]>;
  listarMunicipios(): Promise<Municipio[]>;
  listarMunicipiosDeEstado(estadoId: string): Promise<Municipio[]>;
}
