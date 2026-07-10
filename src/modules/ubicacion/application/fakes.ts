import type {
  Estado,
  Municipio,
} from "@/modules/ubicacion/domain/Ubicacion";
import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";

export class FakeUbicacionRepository implements UbicacionRepository {
  constructor(
    private readonly estados: Estado[] = [],
    private readonly municipios: Municipio[] = [],
  ) {}

  listarEstados(): Promise<Estado[]> {
    return Promise.resolve([...this.estados]);
  }

  listarMunicipiosPorEstado(estadoId: string): Promise<Municipio[]> {
    return Promise.resolve(
      this.municipios.filter((m) => m.estadoId === estadoId),
    );
  }

  listarTodosLosMunicipios(): Promise<Municipio[]> {
    return Promise.resolve([...this.municipios]);
  }

  buscarMunicipioPorId(id: string): Promise<Municipio | null> {
    return Promise.resolve(this.municipios.find((m) => m.id === id) ?? null);
  }
}
