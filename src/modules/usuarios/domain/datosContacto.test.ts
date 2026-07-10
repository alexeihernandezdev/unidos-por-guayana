import { describe, expect, it } from "vitest";
import {
  normalizarCedula,
  normalizarTelefono,
  normalizarUbicacion,
  tieneDatosContactoCompletos,
  validarCedula,
  validarDatosContacto,
  validarTelefono,
  validarUbicacion,
} from "./datosContacto";

describe("validarCedula", () => {
  it("rechaza cadena vacía", () => {
    const r = validarCedula("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("La cédula es obligatoria.");
  });

  it("rechaza un prefijo distinto de V/E/J", () => {
    const r = validarCedula("A12345678");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("La cédula debe empezar por V, E o J.");
  });

  it("rechaza cédulas con menos de 6 dígitos", () => {
    const r = validarCedula("V12345");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("La cédula debe tener entre 6 y 9 dígitos.");
  });

  it("rechaza cédulas con más de 9 dígitos", () => {
    const r = validarCedula("V1234567890");
    expect(r.ok).toBe(false);
  });

  it("acepta V, E y J en mayúscula", () => {
    expect(validarCedula("V12345678")).toEqual({ ok: true, valor: "V12345678" });
    expect(validarCedula("E12345678")).toEqual({ ok: true, valor: "E12345678" });
    expect(validarCedula("J123456789")).toEqual({
      ok: true,
      valor: "J123456789",
    });
  });

  it("normaliza prefijo minúscula, guion y puntos de miles", () => {
    expect(validarCedula("v-12.345.678")).toEqual({
      ok: true,
      valor: "V12345678",
    });
    expect(validarCedula("e 12 345 678")).toEqual({
      ok: true,
      valor: "E12345678",
    });
  });

  it("normalizarCedula devuelve null si la entrada es inválida", () => {
    expect(normalizarCedula("V12")).toBeNull();
    expect(normalizarCedula("V-12.345.678")).toBe("V12345678");
  });
});

describe("validarTelefono", () => {
  it("rechaza cadena vacía", () => {
    const r = validarTelefono("   ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("El teléfono es obligatorio.");
  });

  it("rechaza longitud incorrecta", () => {
    const r = validarTelefono("04121234");
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(r.error).toBe(
        "El teléfono debe tener 11 dígitos (por ejemplo 0412 1234567).",
      );
  });

  it("rechaza código de operadora inválido", () => {
    const r = validarTelefono("04991234567");
    expect(r.ok).toBe(false);
    if (!r.ok)
      expect(r.error).toBe("El código de operadora no es válido en Venezuela.");
  });

  it("acepta y normaliza formato nacional con separadores", () => {
    expect(validarTelefono("0412-1234567")).toEqual({
      ok: true,
      valor: "04121234567",
    });
    expect(validarTelefono("(0414) 123 4567")).toEqual({
      ok: true,
      valor: "04141234567",
    });
  });

  it("convierte prefijo +58 a 0 y valida operadora", () => {
    expect(validarTelefono("+58 412 1234567")).toEqual({
      ok: true,
      valor: "04121234567",
    });
  });

  it("acepta un fijo con código de área conocido", () => {
    expect(validarTelefono("0286-1234567")).toEqual({
      ok: true,
      valor: "02861234567",
    });
  });

  it("normalizarTelefono devuelve null si no es válido", () => {
    expect(normalizarTelefono("0499 111 2222")).toBeNull();
    expect(normalizarTelefono("+58 412 1234567")).toBe("04121234567");
  });
});

describe("validarUbicacion", () => {
  it("rechaza estado vacío", () => {
    const r = validarUbicacion({ estado: "   ", parroquia: "Catia" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("Indica el estado.");
  });

  it("rechaza parroquia vacía", () => {
    const r = validarUbicacion({ estado: "La Guaira", parroquia: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("Indica la parroquia.");
  });

  it("normaliza espacios múltiples", () => {
    const r = validarUbicacion({
      estado: "  La   Guaira  ",
      parroquia: "  Catia  La  Mar ",
    });
    expect(r).toEqual({
      ok: true,
      valor: { estado: "La Guaira", parroquia: "Catia La Mar" },
    });
  });

  it("normalizarUbicacion devuelve null si es inválida", () => {
    expect(
      normalizarUbicacion({ estado: "", parroquia: "Catia" }),
    ).toBeNull();
  });
});

describe("validarDatosContacto", () => {
  it("propaga el primer error encontrado en orden de campos", () => {
    const r = validarDatosContacto({
      cedula: "",
      telefono: "04121234567",
      telefonoEsWhatsApp: true,
      estado: "La Guaira",
      parroquia: "Catia La Mar",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("La cédula es obligatoria.");
  });

  it("normaliza y agrupa los cinco campos", () => {
    const r = validarDatosContacto({
      cedula: "v-12.345.678",
      telefono: "+58 412 1234567",
      telefonoEsWhatsApp: true,
      estado: "  La Guaira  ",
      parroquia: "Catia La Mar",
    });
    expect(r).toEqual({
      ok: true,
      valor: {
        cedula: "V12345678",
        telefono: "04121234567",
        telefonoEsWhatsApp: true,
        estado: "La Guaira",
        parroquia: "Catia La Mar",
      },
    });
  });
});

describe("tieneDatosContactoCompletos", () => {
  it("es true solo si los cuatro obligatorios están presentes", () => {
    expect(
      tieneDatosContactoCompletos({
        cedula: "V12345678",
        telefono: "04121234567",
        estado: "La Guaira",
        parroquia: "Catia La Mar",
      }),
    ).toBe(true);
  });

  it("es false si falta cualquiera de los cuatro", () => {
    const base = {
      cedula: "V12345678",
      telefono: "04121234567",
      estado: "La Guaira",
      parroquia: "Catia",
    };
    expect(tieneDatosContactoCompletos({ ...base, cedula: null })).toBe(false);
    expect(tieneDatosContactoCompletos({ ...base, telefono: null })).toBe(false);
    expect(tieneDatosContactoCompletos({ ...base, estado: null })).toBe(false);
    expect(tieneDatosContactoCompletos({ ...base, parroquia: null })).toBe(
      false,
    );
  });
});
