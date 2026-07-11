import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import {
  AppShell,
  navSectionsPorRol,
  rutaInicioPorRol,
} from "@/shared/ui/app-shell";

// Prefijo del superadministrador (feature 015). El layout exige rol `SUPERADMIN`
// a nivel de segmento: ningún `ADMIN`, `COLABORADOR` ni `SOLICITANTE` accede a
// estas rutas. El chequeo fino de cada acción vive además en los casos de uso.
// Desde 021 usa el shell logeado con sidebar (el navbar global se oculta al
// haber sesión); su única sección es la bandeja de aprobaciones.
export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol(Rol.SUPERADMIN);

  return (
    <AppShell
      sections={navSectionsPorRol(Rol.SUPERADMIN)}
      homeHref={rutaInicioPorRol(Rol.SUPERADMIN)}
      ariaLabel="Panel del superadministrador"
    >
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</div>
    </AppShell>
  );
}
