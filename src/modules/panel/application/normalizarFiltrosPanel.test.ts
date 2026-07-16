import { describe, expect, it } from "vitest";
import { normalizarFiltrosPanel } from "./normalizarFiltrosPanel";

describe("normalizarFiltrosPanel", () => {
  it("acepta un centro propio cuando hay más de uno y un rango inclusivo válido", () => {
    const resultado = normalizarFiltrosPanel(
      { centro: "centro-2", desde: "2026-06-01", hasta: "2026-06-30" },
      ["centro-1", "centro-2"],
    );

    expect(resultado.centro).toBe("centro-2");
    expect(resultado.filtro).toEqual({
      puntoAcopioId: "centro-2",
      fechaDesde: new Date("2026-06-01T00:00:00.000Z"),
      fechaHasta: new Date("2026-06-30T00:00:00.000Z"),
    });
  });

  it("descarta centros ajenos, selecciones únicas y fechas inválidas", () => {
    expect(
      normalizarFiltrosPanel(
        { centro: "ajeno", desde: "2026-02-30", hasta: "2026-06-01" },
        ["centro-1", "centro-2"],
      ),
    ).toEqual({ filtro: {}, centro: undefined, desde: undefined, hasta: undefined });

    expect(normalizarFiltrosPanel({ centro: "centro-1" }, ["centro-1"]).filtro).toEqual({});
  });

  it("descarta rangos invertidos o incompletos", () => {
    expect(
      normalizarFiltrosPanel(
        { desde: "2026-07-01", hasta: "2026-06-01" },
        [],
      ).filtro,
    ).toEqual({});
    expect(normalizarFiltrosPanel({ desde: "2026-06-01" }, []).filtro).toEqual({});
  });
});
