import { describe, expect, it } from "vitest";
import { validarUbicacionCatalogo } from "@/modules/ubicaciones/domain/reglas";
import { catalogoPrueba } from "./fakes";
import { listarEstados } from "./listarEstados";
import { listarMunicipiosPorEstado } from "./listarMunicipiosPorEstado";

describe("validarUbicacionCatalogo", () => {
  const { repo } = catalogoPrueba();

  it("rechaza estado vacío", async () => {
    const r = await validarUbicacionCatalogo(
      { estadoId: "  ", municipioId: "mun-vargas" },
      { ubicaciones: repo },
    );
    expect(r).toEqual({ ok: false, error: "Selecciona el estado." });
  });

  it("rechaza municipio vacío", async () => {
    const r = await validarUbicacionCatalogo(
      { estadoId: "est-lg", municipioId: "" },
      { ubicaciones: repo },
    );
    expect(r).toEqual({ ok: false, error: "Selecciona el municipio." });
  });

  it("rechaza municipio de otro estado", async () => {
    const r = await validarUbicacionCatalogo(
      { estadoId: "est-lg", municipioId: "mun-hatillo" },
      { ubicaciones: repo },
    );
    expect(r).toEqual({
      ok: false,
      error: "El municipio no pertenece al estado seleccionado.",
    });
  });

  it("rechaza municipio desconocido", async () => {
    const r = await validarUbicacionCatalogo(
      { estadoId: "est-lg", municipioId: "fantasma" },
      { ubicaciones: repo },
    );
    expect(r).toEqual({
      ok: false,
      error: "El municipio no pertenece al estado seleccionado.",
    });
  });

  it("acepta municipio del estado", async () => {
    const r = await validarUbicacionCatalogo(
      { estadoId: "est-lg", municipioId: "mun-vargas" },
      { ubicaciones: repo },
    );
    expect(r).toEqual({
      ok: true,
      valor: { estadoId: "est-lg", municipioId: "mun-vargas" },
    });
  });
});

describe("listarEstados / listarMunicipiosPorEstado", () => {
  const { repo } = catalogoPrueba();

  it("lista estados ordenados", async () => {
    const lista = await listarEstados({ ubicaciones: repo });
    expect(lista.map((e) => e.nombre)).toEqual(["La Guaira", "Miranda"]);
  });

  it("filtra municipios por estado", async () => {
    const lista = await listarMunicipiosPorEstado(
      { ubicaciones: repo },
      "est-mi",
    );
    expect(lista.map((m) => m.nombre)).toEqual(["Baruta", "El Hatillo"]);
  });

  it("devuelve vacío si no hay estadoId", async () => {
    const lista = await listarMunicipiosPorEstado({ ubicaciones: repo }, "  ");
    expect(lista).toEqual([]);
  });
});
