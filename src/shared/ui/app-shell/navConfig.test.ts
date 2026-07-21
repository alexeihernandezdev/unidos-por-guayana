import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { navSectionsPorRol, rutaInicioPorRol } from "./navConfig";

// Recolecta todos los hrefs de las secciones de un rol, en orden.
function hrefs(rol: Rol): string[] {
  return navSectionsPorRol(rol).flatMap((s) => s.items.map((i) => i.href));
}

describe("rutaInicioPorRol", () => {
  it("aterriza a cada rol en su espacio", () => {
    expect(rutaInicioPorRol(Rol.ADMIN)).toBe("/panel");
    expect(rutaInicioPorRol(Rol.SUPERADMIN)).toBe("/superadmin/admins");
    expect(rutaInicioPorRol(Rol.AUDITOR)).toBe("/auditoria/solicitudes");
    expect(rutaInicioPorRol(Rol.COLABORADOR)).toBe("/actividades");
    expect(rutaInicioPorRol(Rol.SOLICITANTE)).toBe("/solicitudes");
  });
});

describe("navSectionsPorRol", () => {
  it("da al COLABORADOR sus destinos de operación, testimonios y perfil", () => {
    expect(hrefs(Rol.COLABORADOR)).toEqual([
      "/actividades",
      "/mis-aportes",
      "/puntos-acopio",
      "/mis-testimonios",
      "/mi-perfil",
    ]);
  });

  it("da al SOLICITANTE sus destinos de solicitudes, testimonios y perfil", () => {
    expect(hrefs(Rol.SOLICITANTE)).toEqual([
      "/solicitudes",
      "/solicitudes/nueva",
      "/solicitudes/proponer-recurso",
      "/mis-testimonios",
      "/mi-perfil",
    ]);
  });

  it("incluye moderación en la navegación del ADMIN", () => {
    expect(hrefs(Rol.ADMIN)).toEqual([
      "/panel",
      "/panel/actividades",
      "/panel/solicitudes",
      "/panel/red",
      "/panel/testimonios",
      "/panel/recursos",
      "/panel/donaciones",
      "/panel/perfil",
      "/panel/puntos-acopio",
    ]);
  });

  it("da al SUPERADMIN la gestión de aprobaciones y auditores", () => {
    expect(hrefs(Rol.SUPERADMIN)).toEqual([
      "/superadmin/admins",
      "/superadmin/auditores",
    ]);
  });

  it("da al AUDITOR su cola de solicitudes", () => {
    expect(hrefs(Rol.AUDITOR)).toEqual(["/auditoria/solicitudes"]);
  });

  it("empieza el hogar de cada rol dentro de su propia navegación", () => {
    for (const rol of [
      Rol.ADMIN,
      Rol.SUPERADMIN,
      Rol.AUDITOR,
      Rol.COLABORADOR,
      Rol.SOLICITANTE,
    ] as const) {
      expect(hrefs(rol)).toContain(rutaInicioPorRol(rol));
    }
  });

  it("no deja secciones vacías", () => {
    for (const rol of [
      Rol.ADMIN,
      Rol.SUPERADMIN,
      Rol.AUDITOR,
      Rol.COLABORADOR,
      Rol.SOLICITANTE,
    ] as const) {
      const secciones = navSectionsPorRol(rol);
      expect(secciones.length).toBeGreaterThan(0);
      for (const seccion of secciones) {
        expect(seccion.items.length).toBeGreaterThan(0);
      }
    }
  });
});
