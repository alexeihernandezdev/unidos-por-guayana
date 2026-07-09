import { AdminShell } from "@/modules/admin/ui";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";

// Layout del route group (admin): exige rol ADMIN a nivel de segmento y envuelve
// todo el /panel/* con el shell del panel (sidebar + main). Cada página anida
// no necesita repetir `requireRol` aunque puede hacerlo por defensa en depth.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol(Rol.ADMIN);

  return <AdminShell>{children}</AdminShell>;
}
