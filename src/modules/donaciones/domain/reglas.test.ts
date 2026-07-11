import { describe, expect, it } from "vitest";
import {
  esDatosValido,
  esMonedaValida,
  esPublicable,
  esTitularValido,
  normalizarNotaMedio,
} from "./reglas";

describe("reglas de MedioDonacion", () => {
  it("exige titular no vacío", () => {
    expect(esTitularValido("Fundación La Guaira")).toBe(true);
    expect(esTitularValido("   ")).toBe(false);
    expect(esTitularValido("")).toBe(false);
  });

  it("exige datos no vacíos", () => {
    expect(esDatosValido("0102-1234-56-7890123456")).toBe(true);
    expect(esDatosValido("  ")).toBe(false);
  });

  it("acepta solo monedas del conjunto permitido", () => {
    expect(esMonedaValida("USD")).toBe(true);
    expect(esMonedaValida("VES")).toBe(true);
    expect(esMonedaValida(" USDT ")).toBe(true);
    expect(esMonedaValida("BTC")).toBe(false);
    expect(esMonedaValida("")).toBe(false);
  });

  it("normaliza la nota: recorta y convierte vacío en null", () => {
    expect(normalizarNotaMedio("  Enviar comprobante  ")).toBe(
      "Enviar comprobante",
    );
    expect(normalizarNotaMedio("   ")).toBeNull();
    expect(normalizarNotaMedio(null)).toBeNull();
    expect(normalizarNotaMedio(undefined)).toBeNull();
  });

  it("es publicable solo si está activo", () => {
    expect(esPublicable({ activo: true })).toBe(true);
    expect(esPublicable({ activo: false })).toBe(false);
  });
});
