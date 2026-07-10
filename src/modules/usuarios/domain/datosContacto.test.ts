import { describe, expect, it } from "vitest";
import {
  validarCedula,
  validarDatosContacto,
  validarTelefono,
  validarUbicacion,
  tieneDatosContactoCompletos,
} from "./datosContacto";

describe("validarUbicacion", () => {
  it("rechaza estadoId vacío", () => {
    const r = validarUbicacion({ estadoId: "   ", municipioId: "mun-1" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("Indica el estado.");
  });

  it("rechaza municipioId vacío", () => {
    const r = validarUbicacion({ estadoId: "est-1", municipioId: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("Indica el municipio.");
  });

  it("acepta IDs presentes", () => {
    expect(validarUbicacion({ estadoId: "est-1", municipioId: "mun-1" })).toEqual({
      ok: true,
      valor: { estadoId: "est-1", municipioId: "mun-1" },
    });
  });
});

describe("validarDatosContacto", () => {
  it("normaliza cédula y teléfono y conserva IDs de ubicación", () => {
    const r = validarDatosContacto({
      cedula: "v-12.345.678",
      telefono: "+58 412 1234567",
      telefonoEsWhatsApp: true,
      estadoId: "est-lg",
      municipioId: "mun-vargas",
    });
    expect(r).toEqual({
      ok: true,
      valor: {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estadoId: "est-lg",
        municipioId: "mun-vargas",
      },
    });
  });
});

describe("tieneDatosContactoCompletos", () => {
  it("es true cuando los cuatro campos obligatorios tienen valor", () => {
    expect(
      tieneDatosContactoCompletos({
        cedula: "V12345678",
        telefono: "04121234567",
        estadoId: "est-lg",
        municipioId: "mun-vargas",
      }),
    ).toBe(true);
  });

  it("es false si falta municipioId", () => {
    expect(
      tieneDatosContactoCompletos({
        cedula: "V12345678",
        telefono: "04121234567",
        estadoId: "est-lg",
        municipioId: null,
      }),
    ).toBe(false);
  });
});

describe("validarCedula y validarTelefono", () => {
  it("siguen validando formato como antes", () => {
    expect(validarCedula("V12345678").ok).toBe(true);
    expect(validarTelefono("04121234567").ok).toBe(true);
  });
});
