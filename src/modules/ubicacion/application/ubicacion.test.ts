import { describe, expect, it } from "vitest";
import { FakeUbicacionRepository } from "./fakes";
import { obtenerCatalogoParaFormulario } from "./obtenerCatalogoParaFormulario";
import { UbicacionInvalidaError, validarUbicacionCatalogo } from "./validarUbicacionCatalogo";

const estados = [
  {
    id: "est-1",
    codigoIso: "VE-A",
    idIne: 1,
    nombre: "Amazonas",
    capital: "Puerto Ayacucho",
  },
  {
    id: "est-2",
    codigoIso: "VE-X",
    idIne: 22,
    nombre: "La Guaira",
    capital: "La Guaira",
  },
];

const municipios = [
  {
    id: "mun-1",
    nombre: "Alto Orinoco",
    capital: "La Esmeralda",
    estadoId: "est-1",
  },
  {
    id: "mun-2",
    nombre: "Vargas",
    capital: "La Guaira",
    estadoId: "est-2",
  },
];

describe("validarUbicacionCatalogo", () => {
  it("acepta municipio que pertenece al estado", async () => {
    const ubicacion = new FakeUbicacionRepository(estados, municipios);
    const resultado = await validarUbicacionCatalogo(
      { ubicacion },
      { estadoId: "est-2", municipioId: "mun-2" },
    );
    expect(resultado).toEqual({ estadoId: "est-2", municipioId: "mun-2" });
  });

  it("rechaza municipio de otro estado", async () => {
    const ubicacion = new FakeUbicacionRepository(estados, municipios);
    await expect(
      validarUbicacionCatalogo(
        { ubicacion },
        { estadoId: "est-1", municipioId: "mun-2" },
      ),
    ).rejects.toBeInstanceOf(UbicacionInvalidaError);
  });
});

describe("obtenerCatalogoParaFormulario", () => {
  it("agrupa municipios por estado ordenados alfabéticamente", async () => {
    const ubicacion = new FakeUbicacionRepository(estados, municipios);
    const catalogo = await obtenerCatalogoParaFormulario({ ubicacion });
    expect(catalogo.estados).toHaveLength(2);
    expect(catalogo.municipiosPorEstado["est-2"]).toEqual([
      { id: "mun-2", nombre: "Vargas" },
    ]);
  });
});
