import type { CatalogoUbicacionRepository } from "@/modules/ubicacion/domain/CatalogoUbicacionRepository";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";

// Doble en memoria del catálogo para los tests de dominio y de casos de uso. No
// toca la base. Se construye con estados y municipios ya resueltos.
export class InMemoryCatalogoUbicacionRepository
  implements CatalogoUbicacionRepository
{
  private readonly estados: Estado[];
  private readonly municipios: Municipio[];

  constructor(estados: Estado[] = [], municipios: Municipio[] = []) {
    this.estados = estados;
    this.municipios = municipios;
  }

  async buscarEstado(id: string): Promise<Estado | null> {
    return this.estados.find((estado) => estado.id === id) ?? null;
  }

  async buscarMunicipio(id: string): Promise<Municipio | null> {
    return this.municipios.find((municipio) => municipio.id === id) ?? null;
  }

  async listarEstados(): Promise<Estado[]> {
    return [...this.estados];
  }

  async listarMunicipios(): Promise<Municipio[]> {
    return [...this.municipios];
  }

  async listarMunicipiosDeEstado(estadoId: string): Promise<Municipio[]> {
    return this.municipios.filter(
      (municipio) => municipio.estadoId === estadoId,
    );
  }
}

// Catálogo mínimo reutilizable por los tests: dos estados con un municipio cada
// uno, suficiente para cubrir existencia y pertenencia estado↔municipio.
export function catalogoDePrueba(): {
  repo: InMemoryCatalogoUbicacionRepository;
  guaira: Estado;
  miranda: Estado;
  vargas: Municipio;
  baruta: Municipio;
} {
  const guaira: Estado = { id: "est-guaira", codigo: "VE-X", nombre: "La Guaira" };
  const miranda: Estado = { id: "est-miranda", codigo: "VE-M", nombre: "Miranda" };
  const vargas: Municipio = {
    id: "mun-vargas",
    codigo: "VE-X-01",
    nombre: "Vargas",
    estadoId: guaira.id,
  };
  const baruta: Municipio = {
    id: "mun-baruta",
    codigo: "VE-M-03",
    nombre: "Baruta",
    estadoId: miranda.id,
  };
  const repo = new InMemoryCatalogoUbicacionRepository(
    [guaira, miranda],
    [vargas, baruta],
  );
  return { repo, guaira, miranda, vargas, baruta };
}
