import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireAdminVerificado } from "@/shared/auth";
import {
  AppShell,
  navSectionsPorRol,
  rutaInicioPorRol,
} from "@/shared/ui/app-shell";

// Layout del route group (admin): exige un ADMIN **verificado** a nivel de
// segmento (feature 015) y envuelve todo el /panel/* con el shell logeado
// (sidebar + main). Un ADMIN en PENDIENTE/RECHAZADO se redirige a /cuenta-admin.
// Cada página anidada no necesita repetir el guard, aunque puede hacerlo por
// defensa en profundidad. Desde 021 el shell es compartido (`AppShell`) y la
// navegación viene de `navSectionsPorRol(ADMIN)` (misma que 008).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminVerificado();

  return (
    <AppShell
      sections={navSectionsPorRol(Rol.ADMIN)}
      homeHref={rutaInicioPorRol(Rol.ADMIN)}
      ariaLabel="Panel de administración"
    >
      {children}
    </AppShell>
  );
}
