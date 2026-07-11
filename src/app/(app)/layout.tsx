import { requireSesion } from "@/shared/auth";
import {
  AppShell,
  navSectionsPorRol,
  rutaInicioPorRol,
} from "@/shared/ui/app-shell";

// Layout del route group (app): espacio de trabajo de los usuarios logeados
// no-admin (feature 021). Envuelve /actividades, /mis-aportes, /mi-perfil y
// /solicitudes con el mismo shell (sidebar + main) del panel de admin,
// parametrizado por el rol de la sesión.
//
// La autorización fina (rol permitido + perfil completo) la aplica cada página
// con `requireRol(...)`; aquí solo exigimos sesión y elegimos la navegación
// según el rol real (así un ADMIN que entra a /actividades ve su propio sidebar).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await requireSesion();

  return (
    <AppShell
      sections={navSectionsPorRol(usuario.rol)}
      homeHref={rutaInicioPorRol(usuario.rol)}
      ariaLabel="Tu espacio"
    >
      {children}
    </AppShell>
  );
}
