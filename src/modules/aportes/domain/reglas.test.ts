import { describe, expect, it } from "vitest";
import { ETIQUETA_ANONIMO, nombrePublicoAportante } from "./reglas";

describe("nombrePublicoAportante", () => {
  it("devuelve el nombre cuando no es anónimo y hay colaborador", () => {
    expect(nombrePublicoAportante(false, "Ana Pérez")).toBe("Ana Pérez");
  });

  it("oculta el nombre cuando el aporte es anónimo", () => {
    expect(nombrePublicoAportante(true, "Ana Pérez")).toBe(ETIQUETA_ANONIMO);
  });

  it("devuelve la etiqueta cuando no hay colaborador (donación directa)", () => {
    expect(nombrePublicoAportante(false, null)).toBe(ETIQUETA_ANONIMO);
  });

  it("es 'Anónimo'", () => {
    expect(ETIQUETA_ANONIMO).toBe("Anónimo");
  });
});
