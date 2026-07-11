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
    expect(rutaInicioPorRol(Rol.COLABORADOR)).toBe("/actividades");
    expect(rutaInicioPorRol(Rol.SOLICITANTE)).toBe("/solicitudes");
  });
});

describe("navSectionsPorRol", () => {
  it("da al COLABORADOR sus destinos (actividades, aportes, puntos, perfil)", () => {
    expect(hrefs(Rol.COLABORADOR)).toEqual([
      "/actividades",
      "/mis-aportes",
      "/puntos-acopio",
      "/mi-perfil",
    ]);
  });

  it("da al SOLICITANTE sus destinos (solicitudes, nueva, proponer, perfil)", () => {
    expect(hrefs(Rol.SOLICITANTE)).toEqual([
      "/solicitudes",
      "/solicitudes/nueva",
      "/solicitudes/proponer-recurso",
      "/mi-perfil",
    ]);
  });

  it("conserva la navegación del panel del ADMIN (008 + puntos de 011 + donaciones de 014)", () => {
    expect(hrefs(Rol.ADMIN)).toEqual([
      "/panel",
      "/panel/actividades",
      "/panel/solicitudes",
      "/panel/red",
      "/panel/recursos",
      "/panel/donaciones",
      "/panel/perfil",
      "/panel/puntos-acopio",
    ]);
  });

  it("da al SUPERADMIN solo la bandeja de aprobaciones", () => {
    expect(hrefs(Rol.SUPERADMIN)).toEqual(["/superadmin/admins"]);
  });

  it("empieza el hogar de cada rol dentro de su propia navegación", () => {
    for (const rol of [
      Rol.ADMIN,
      Rol.SUPERADMIN,
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
