import { describe, expect, it } from "vitest";
import {
  codigoOtpCoincide,
  enmascararTelefono,
  generarCodigoOtp,
  hashCodigoOtp,
} from "./VerificacionTelefono";

describe("VerificacionTelefono", () => {
  it("genera códigos numéricos de seis dígitos incluyendo ceros iniciales", () => {
    for (let i = 0; i < 100; i += 1) {
      expect(generarCodigoOtp()).toMatch(/^\d{6}$/);
    }
  });

  it("verifica el código mediante HMAC ligado a la solicitud", () => {
    const hash = hashCodigoOtp("solicitud-1", "012345", "secreto");
    expect(
      codigoOtpCoincide("solicitud-1", "012345", hash, "secreto"),
    ).toBe(true);
    expect(
      codigoOtpCoincide("solicitud-1", "999999", hash, "secreto"),
    ).toBe(false);
    expect(
      codigoOtpCoincide("otra", "012345", hash, "secreto"),
    ).toBe(false);
  });

  it("enmascara el teléfono sin ocultar los últimos cuatro dígitos", () => {
    const resultado = enmascararTelefono("+584121234567");
    expect(resultado).toContain("4567");
    expect(resultado).not.toContain("412123");
  });
});

