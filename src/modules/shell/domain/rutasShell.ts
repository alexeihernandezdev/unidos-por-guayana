// Rutas que usan el shell con sidebar (panel de funcionalidades). `/panel/*` lo
// gestiona el layout de administrador con `AdminShell`; el resto usa `AppShell`.
const PREFIJOS_SHELL_USUARIO = [
  "/solicitudes",
  "/ayudas",
  "/mis-aportes",
  "/mi-perfil",
  "/superadmin",
  "/cuenta-admin",
  "/completar-perfil",
] as const;

export function esRutaShellUsuario(pathname: string): boolean {
  return PREFIJOS_SHELL_USUARIO.some(
    (prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`),
  );
}

export function esRutaShellAdmin(pathname: string): boolean {
  return pathname === "/panel" || pathname.startsWith("/panel/");
}

export function esRutaConSidebar(pathname: string): boolean {
  return esRutaShellAdmin(pathname) || esRutaShellUsuario(pathname);
}
