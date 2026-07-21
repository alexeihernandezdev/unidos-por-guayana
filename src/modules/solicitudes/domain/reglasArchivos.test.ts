import { describe, expect, it } from "vitest";
import { TipoArchivoSolicitud } from "./ArchivoSolicitud";
import {
  construirPath,
  esAdjuntoValido,
  esImagenPrincipalValida,
  esPathDeSolicitud,
  extensionDe,
  MAX_BYTES_ADJUNTO,
  MAX_BYTES_PRINCIPAL,
  puedeAgregarAdjunto,
} from "./reglasArchivos";

describe("reglasArchivos", () => {
  describe("esImagenPrincipalValida", () => {
    it("acepta JPG/PNG/WEBP dentro del límite", () => {
      expect(esImagenPrincipalValida("image/png", 1024)).toBe(true);
      expect(esImagenPrincipalValida("image/jpeg", MAX_BYTES_PRINCIPAL)).toBe(
        true,
      );
      expect(esImagenPrincipalValida("image/webp", 500)).toBe(true);
    });

    it("rechaza tipos no imagen, PDFs y tamaños fuera de rango", () => {
      expect(esImagenPrincipalValida("application/pdf", 1024)).toBe(false);
      expect(esImagenPrincipalValida("image/gif", 1024)).toBe(false);
      expect(esImagenPrincipalValida("image/png", MAX_BYTES_PRINCIPAL + 1)).toBe(
        false,
      );
      expect(esImagenPrincipalValida("image/png", 0)).toBe(false);
    });
  });

  describe("esAdjuntoValido", () => {
    it("acepta imágenes, PDF y documentos Word dentro del límite", () => {
      expect(esAdjuntoValido("image/png", 1024)).toBe(true);
      expect(esAdjuntoValido("application/pdf", MAX_BYTES_ADJUNTO)).toBe(true);
      expect(esAdjuntoValido("application/msword", 2048)).toBe(true);
      expect(
        esAdjuntoValido(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          2048,
        ),
      ).toBe(true);
    });

    it("rechaza tipos no permitidos y tamaños fuera de rango", () => {
      expect(esAdjuntoValido("text/plain", 1024)).toBe(false);
      expect(esAdjuntoValido("application/pdf", MAX_BYTES_ADJUNTO + 1)).toBe(
        false,
      );
      expect(esAdjuntoValido("application/pdf", 0)).toBe(false);
    });
  });

  describe("puedeAgregarAdjunto", () => {
    it("permite hasta 10 y bloquea el número 11", () => {
      expect(puedeAgregarAdjunto(0)).toBe(true);
      expect(puedeAgregarAdjunto(9)).toBe(true);
      expect(puedeAgregarAdjunto(10)).toBe(false);
    });
  });

  describe("extensionDe", () => {
    it("mapea los tipos MIME conocidos a su extensión", () => {
      expect(extensionDe("image/jpeg")).toBe("jpg");
      expect(extensionDe("image/png")).toBe("png");
      expect(extensionDe("application/pdf")).toBe("pdf");
      expect(
        extensionDe(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ),
      ).toBe("docx");
      expect(extensionDe("text/plain")).toBeNull();
    });
  });

  describe("construirPath / esPathDeSolicitud", () => {
    it("construye la ruta por tipo y valida su pertenencia", () => {
      const principal = construirPath(
        "sol-1",
        TipoArchivoSolicitud.PRINCIPAL,
        "uuid-1",
        "image/png",
      );
      expect(principal).toBe("solicitudes/sol-1/principal/uuid-1.png");
      expect(
        esPathDeSolicitud(principal, "sol-1", TipoArchivoSolicitud.PRINCIPAL),
      ).toBe(true);

      const adjunto = construirPath(
        "sol-1",
        TipoArchivoSolicitud.ADJUNTO,
        "uuid-2",
        "application/pdf",
      );
      expect(adjunto).toBe("solicitudes/sol-1/adjuntos/uuid-2.pdf");
      expect(
        esPathDeSolicitud(adjunto, "sol-1", TipoArchivoSolicitud.ADJUNTO),
      ).toBe(true);
    });

    it("rechaza rutas de otra solicitud o de otro tipo", () => {
      const path = "solicitudes/sol-1/principal/uuid-1.png";
      expect(esPathDeSolicitud(path, "sol-2", TipoArchivoSolicitud.PRINCIPAL)).toBe(
        false,
      );
      expect(esPathDeSolicitud(path, "sol-1", TipoArchivoSolicitud.ADJUNTO)).toBe(
        false,
      );
    });
  });
});
