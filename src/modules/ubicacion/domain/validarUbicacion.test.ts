import { describe, expect, it } from "vitest";
import type { CatalogoUbicacionRepository } from "./CatalogoUbicacionRepository";
import type { Estado } from "./Estado";
import type { Municipio } from "./Municipio";
import { validarUbicacion } from "./validarUbicacion";

// Fake inline del puerto (la capa domain no puede importar application/infra).
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

const estados = [guaira, miranda];
const municipios = [vargas, baruta];

const catalogo: CatalogoUbicacionRepository = {
  buscarEstado: async (id) => estados.find((e) => e.id === id) ?? null,
  buscarMunicipio: async (id) => municipios.find((m) => m.id === id) ?? null,
  listarEstados: async () => [...estados],
  listarMunicipios: async () => [...municipios],
  listarMunicipiosDeEstado: async (estadoId) =>
    municipios.filter((m) => m.estadoId === estadoId),
};

describe("validarUbicacion", () => {
  it("acepta un par estado↔municipio coherente y normaliza (trim)", async () => {
    const resultado = await validarUbicacion(
      { estadoId: `  ${guaira.id} `, municipioId: ` ${vargas.id}  ` },
      catalogo,
    );
    expect(resultado).toEqual({
      ok: true,
      valor: { estadoId: guaira.id, municipioId: vargas.id },
    });
  });

  it("rechaza estado vacío", async () => {
    const resultado = await validarUbicacion(
      { estadoId: "", municipioId: vargas.id },
      catalogo,
    );
    expect(resultado).toEqual({ ok: false, error: "Selecciona el estado." });
  });

  it("rechaza municipio vacío", async () => {
    const resultado = await validarUbicacion(
      { estadoId: guaira.id, municipioId: "" },
      catalogo,
    );
    expect(resultado).toEqual({ ok: false, error: "Selecciona el municipio." });
  });

  it("rechaza estado inexistente", async () => {
    const resultado = await validarUbicacion(
      { estadoId: "est-fantasma", municipioId: vargas.id },
      catalogo,
    );
    expect(resultado).toEqual({
      ok: false,
      error: "El estado seleccionado no es válido.",
    });
  });

  it("rechaza municipio inexistente", async () => {
    const resultado = await validarUbicacion(
      { estadoId: guaira.id, municipioId: "mun-fantasma" },
      catalogo,
    );
    expect(resultado).toEqual({
      ok: false,
      error: "El municipio seleccionado no es válido.",
    });
  });

  it("rechaza municipio que no pertenece al estado elegido", async () => {
    const resultado = await validarUbicacion(
      { estadoId: guaira.id, municipioId: baruta.id },
      catalogo,
    );
    expect(resultado).toEqual({
      ok: false,
      error: "El municipio no pertenece al estado seleccionado.",
    });
  });
});
