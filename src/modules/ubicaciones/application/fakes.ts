import type {
  Estado,
  Municipio,
} from "@/modules/ubicaciones/domain/Ubicacion";
import type { UbicacionRepository } from "@/modules/ubicaciones/domain/UbicacionRepository";

export class InMemoryUbicacionRepository implements UbicacionRepository {
  constructor(
    private readonly estados: Estado[] = [],
    private readonly municipios: Municipio[] = [],
  ) {}

  async listarEstados(): Promise<Estado[]> {
    return [...this.estados].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }

  async listarMunicipiosPorEstado(estadoId: string): Promise<Municipio[]> {
    return this.municipios
      .filter((m) => m.estadoId === estadoId)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }

  async obtenerEstado(id: string): Promise<Estado | null> {
    return this.estados.find((e) => e.id === id) ?? null;
  }

  async obtenerMunicipio(id: string): Promise<Municipio | null> {
    return this.municipios.find((m) => m.id === id) ?? null;
  }
}

/** Catálogo mínimo para tests de pertenencia y listados. */
export function catalogoPrueba(): {
  estados: Estado[];
  municipios: Municipio[];
  repo: InMemoryUbicacionRepository;
} {
  const estados: Estado[] = [
    { id: "est-lg", codigo: "LG", nombre: "La Guaira" },
    { id: "est-mi", codigo: "MI", nombre: "Miranda" },
  ];
  const municipios: Municipio[] = [
    { id: "mun-vargas", codigo: null, nombre: "Vargas", estadoId: "est-lg" },
    { id: "mun-hatillo", codigo: null, nombre: "El Hatillo", estadoId: "est-mi" },
    { id: "mun-baruta", codigo: null, nombre: "Baruta", estadoId: "est-mi" },
  ];
  return {
    estados,
    municipios,
    repo: new InMemoryUbicacionRepository(estados, municipios),
  };
}
