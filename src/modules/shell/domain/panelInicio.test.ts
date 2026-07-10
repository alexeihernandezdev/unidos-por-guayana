import { describe, expect, it } from "vitest";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { panelInicioPorRol } from "./panelInicio";
import { esRutaConSidebar, esRutaShellUsuario } from "./rutasShell";

describe("panelInicioPorRol", () => {
  it("envía cada rol a su panel principal", () => {
    expect(panelInicioPorRol(Rol.SUPERADMIN)).toBe("/superadmin/admins");
    expect(panelInicioPorRol(Rol.ADMIN)).toBe("/panel");
    expect(panelInicioPorRol(Rol.COLABORADOR)).toBe("/ayudas");
    expect(panelInicioPorRol(Rol.SOLICITANTE)).toBe("/solicitudes");
  });
});

describe("rutasShell", () => {
  it("detecta rutas de usuario con sidebar", () => {
    expect(esRutaShellUsuario("/solicitudes")).toBe(true);
    expect(esRutaShellUsuario("/solicitudes/nueva")).toBe(true);
    expect(esRutaShellUsuario("/ayudas/abc")).toBe(true);
    expect(esRutaShellUsuario("/")).toBe(false);
    expect(esRutaShellUsuario("/transparencia")).toBe(false);
  });

  it("agrupa panel admin y usuario", () => {
    expect(esRutaConSidebar("/panel")).toBe(true);
    expect(esRutaConSidebar("/panel/ayudas")).toBe(true);
    expect(esRutaConSidebar("/mis-aportes")).toBe(true);
    expect(esRutaConSidebar("/login")).toBe(false);
  });
});
