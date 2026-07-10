import { AdminShell } from "@/modules/admin/ui";
import { requireAdminVerificado } from "@/shared/auth";

// Layout del route group (admin): exige un ADMIN **verificado** a nivel de
// segmento (feature 015) y envuelve todo el /panel/* con el shell del panel
// (sidebar + main). Un ADMIN en PENDIENTE/RECHAZADO se redirige a /cuenta-admin.
// Cada página anidada no necesita repetir el guard, aunque puede hacerlo por
// defensa en profundidad.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminVerificado();

  return <AdminShell>{children}</AdminShell>;
}
