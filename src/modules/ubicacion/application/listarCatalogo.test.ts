import { describe, expect, it } from "vitest";
import {
  cargarCatalogoUbicacion,
  listarEstados,
  listarMunicipiosDeEstado,
} from "./listarCatalogo";
import { catalogoDePrueba } from "./fakes";

describe("lecturas del catálogo de ubicación", () => {
  it("listarEstados devuelve todos los estados", async () => {
    const { repo, guaira, miranda } = catalogoDePrueba();
    const estados = await listarEstados(repo);
    expect(estados).toHaveLength(2);
    expect(estados.map((e) => e.id).sort()).toEqual(
      [guaira.id, miranda.id].sort(),
    );
  });

  it("listarMunicipiosDeEstado filtra por estado", async () => {
    const { repo, guaira, vargas } = catalogoDePrueba();
    const municipios = await listarMunicipiosDeEstado(repo, guaira.id);
    expect(municipios).toHaveLength(1);
    expect(municipios[0].id).toBe(vargas.id);
    expect(municipios[0].estadoId).toBe(guaira.id);
  });

  it("cargarCatalogoUbicacion devuelve estados y todos los municipios", async () => {
    const { repo } = catalogoDePrueba();
    const catalogo = await cargarCatalogoUbicacion(repo);
    expect(catalogo.estados).toHaveLength(2);
    expect(catalogo.municipios).toHaveLength(2);
  });
});
