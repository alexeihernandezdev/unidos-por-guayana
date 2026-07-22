import { describe, expect, it } from "vitest";
import {
  construirPathEvidencia,
  esEvidenciaValida,
  esPathDeEvidencia,
  MAX_BYTES_EVIDENCIA,
  MAX_EVIDENCIAS,
  puedeAgregarEvidencia,
} from "./reglasEvidencia";

describe("reglas de evidencia de auditoría", () => {
  it("acepta imagen, video y PDF dentro del tamaño", () => {
    expect(esEvidenciaValida("image/png", 1024)).toBe(true);
    expect(esEvidenciaValida("video/mp4", 50 * 1024 * 1024)).toBe(true);
    expect(esEvidenciaValida("video/quicktime", MAX_BYTES_EVIDENCIA)).toBe(true);
    expect(esEvidenciaValida("application/pdf", 2048)).toBe(true);
  });

  it("rechaza tipos no permitidos y tamaños fuera de rango", () => {
    expect(esEvidenciaValida("text/plain", 100)).toBe(false);
    expect(
      esEvidenciaValida("application/msword", 100),
    ).toBe(false); // Word no es evidencia
    expect(esEvidenciaValida("video/mp4", 0)).toBe(false);
    expect(esEvidenciaValida("video/mp4", MAX_BYTES_EVIDENCIA + 1)).toBe(false);
  });

  it("limita la cantidad de evidencias", () => {
    expect(puedeAgregarEvidencia(0)).toBe(true);
    expect(puedeAgregarEvidencia(MAX_EVIDENCIAS - 1)).toBe(true);
    expect(puedeAgregarEvidencia(MAX_EVIDENCIAS)).toBe(false);
  });

  it("construye la ruta bajo el prefijo de auditoría y la valida", () => {
    const path = construirPathEvidencia("sol-1", "uuid-1", "video/mp4");
    expect(path).toBe("auditoria/sol-1/evidencia/uuid-1.mp4");
    expect(esPathDeEvidencia(path, "sol-1")).toBe(true);
    expect(esPathDeEvidencia(path, "sol-2")).toBe(false);
    // No debe confundirse con la carpeta de archivos del solicitante (feature 031).
    expect(esPathDeEvidencia("solicitudes/sol-1/adjuntos/x.pdf", "sol-1")).toBe(
      false,
    );
  });
});
