import { describe, expect, it } from "vitest";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import {
  categoriasNoVacias,
  intersectanCategorias,
  normalizarCategorias,
  perteneceARed,
} from "./reglas";

describe("normalizarCategorias", () => {
  it("descarta valores no válidos y duplicados, en orden canónico", () => {
    expect(
      normalizarCategorias([
        "PERSONAL",
        "SUMINISTRO",
        "PERSONAL",
        "NADA",
      ]),
    ).toEqual([CategoriaRecurso.SUMINISTRO, CategoriaRecurso.PERSONAL]);
  });

  it("devuelve vacío si no hay ninguna válida", () => {
    expect(normalizarCategorias(["X", ""])).toEqual([]);
  });
});

describe("categoriasNoVacias", () => {
  it("exige al menos una", () => {
    expect(categoriasNoVacias([])).toBe(false);
    expect(categoriasNoVacias([CategoriaRecurso.MONETARIO])).toBe(true);
  });
});

describe("intersectanCategorias", () => {
  it("es true si hay al menos una en común", () => {
    expect(
      intersectanCategorias(
        [CategoriaRecurso.TRANSPORTE, CategoriaRecurso.PERSONAL],
        [CategoriaRecurso.PERSONAL],
      ),
    ).toBe(true);
  });

  it("es false si no hay ninguna en común", () => {
    expect(
      intersectanCategorias(
        [CategoriaRecurso.TRANSPORTE],
        [CategoriaRecurso.MONETARIO],
      ),
    ).toBe(false);
  });

  it("es false con conjuntos vacíos", () => {
    expect(intersectanCategorias([], [CategoriaRecurso.PERSONAL])).toBe(false);
  });
});

describe("perteneceARed", () => {
  it("compara el adminId dueño de la afiliación", () => {
    expect(perteneceARed({ adminId: "a1" }, "a1")).toBe(true);
    expect(perteneceARed({ adminId: "a1" }, "a2")).toBe(false);
  });
});
