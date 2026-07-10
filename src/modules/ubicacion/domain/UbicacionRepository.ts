import type { Estado, Municipio } from "./Ubicacion";

export type UbicacionRepository = {
  listarEstados(): Promise<Estado[]>;
  listarMunicipiosPorEstado(estadoId: string): Promise<Municipio[]>;
  listarTodosLosMunicipios(): Promise<Municipio[]>;
  buscarMunicipioPorId(id: string): Promise<Municipio | null>;
};
