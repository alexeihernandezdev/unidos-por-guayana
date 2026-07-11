import { describe, expect, it } from "vitest";
import {
  aplicarHerenciaUbicacion,
  esCoordenadaLatitud,
  esCoordenadaLongitud,
  esTextoNoVacio,
  normalizarCoordenada,
  perteneceA,
} from "./reglas";

describe("esTextoNoVacio", () => {
  it("acepta texto con contenido", () => {
    expect(esTextoNoVacio("Casa Roja")).toBe(true);
  });
  it("rechaza vacío o solo espacios", () => {
    expect(esTextoNoVacio("")).toBe(false);
    expect(esTextoNoVacio("   ")).toBe(false);
  });
});

describe("esCoordenadaLatitud", () => {
  it("acepta latitudes en [-90, 90]", () => {
    expect(esCoordenadaLatitud("0")).toBe(true);
    expect(esCoordenadaLatitud("10.5")).toBe(true);
    expect(esCoordenadaLatitud("-90")).toBe(true);
    expect(esCoordenadaLatitud("90")).toBe(true);
  });
  it("acepta formato con coma decimal", () => {
    expect(esCoordenadaLatitud("10,5")).toBe(true);
  });
  it("rechaza fuera de rango o no numérico", () => {
    expect(esCoordenadaLatitud("90.1")).toBe(false);
    expect(esCoordenadaLatitud("-91")).toBe(false);
    expect(esCoordenadaLatitud("")).toBe(false);
    expect(esCoordenadaLatitud("abc")).toBe(false);
  });
});

describe("esCoordenadaLongitud", () => {
  it("acepta longitudes en [-180, 180]", () => {
    expect(esCoordenadaLongitud("0")).toBe(true);
    expect(esCoordenadaLongitud("-66.9")).toBe(true);
    expect(esCoordenadaLongitud("180")).toBe(true);
    expect(esCoordenadaLongitud("-180")).toBe(true);
  });
  it("rechaza fuera de rango", () => {
    expect(esCoordenadaLongitud("180.1")).toBe(false);
    expect(esCoordenadaLongitud("-180.1")).toBe(false);
  });
});

describe("normalizarCoordenada", () => {
  it("convierte coma a punto", () => {
    expect(normalizarCoordenada("10,5")).toBe("10.5");
  });
  it("recorta y unifica formato", () => {
    expect(normalizarCoordenada("  10.500000 ")).toBe("10.5");
  });
  it("devuelve tal cual el trim si no parsea", () => {
    expect(normalizarCoordenada("  abc ")).toBe("abc");
  });
});

describe("perteneceA", () => {
  it("acepta cuando el adminId coincide", () => {
    expect(perteneceA({ adminId: "admin-1" }, "admin-1")).toBe(true);
  });
  it("rechaza cuando el adminId no coincide", () => {
    expect(perteneceA({ adminId: "admin-1" }, "admin-2")).toBe(false);
  });
});

describe("aplicarHerenciaUbicacion", () => {
  const ubicacionAdmin = { estadoId: "est-1", municipioId: "mun-1" };

  it("hereda ambos cuando la entrada viene vacía", () => {
    expect(
      aplicarHerenciaUbicacion(
        { estadoId: "", municipioId: "" },
        ubicacionAdmin,
      ),
    ).toEqual({ estadoId: "est-1", municipioId: "mun-1" });
  });

  it("respeta lo indicado en la entrada", () => {
    expect(
      aplicarHerenciaUbicacion(
        { estadoId: "est-9", municipioId: "mun-9" },
        ubicacionAdmin,
      ),
    ).toEqual({ estadoId: "est-9", municipioId: "mun-9" });
  });

  it("mezcla: hereda solo lo que falta", () => {
    expect(
      aplicarHerenciaUbicacion(
        { estadoId: "est-9", municipioId: "" },
        ubicacionAdmin,
      ),
    ).toEqual({ estadoId: "est-9", municipioId: "mun-1" });
  });

  it("devuelve null si tras la herencia sigue faltando (perfil vacío)", () => {
    expect(
      aplicarHerenciaUbicacion({ estadoId: "", municipioId: "" }, null),
    ).toBeNull();
    expect(
      aplicarHerenciaUbicacion(
        { estadoId: "est-1", municipioId: "" },
        null,
      ),
    ).toBeNull();
  });
});
