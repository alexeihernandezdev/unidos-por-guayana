import type { Estado, Municipio } from "./Ubicacion";

// Contrato de persistencia del catálogo. Solo lectura en runtime (el alta es seed).

export interface UbicacionRepository {
  listarEstados(): Promise<Estado[]>;
  listarMunicipiosPorEstado(estadoId: string): Promise<Municipio[]>;
  obtenerEstado(id: string): Promise<Estado | null>;
  obtenerMunicipio(id: string): Promise<Municipio | null>;
}
