import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";

// Prefijo del superadministrador (feature 015). El layout exige rol `SUPERADMIN`
// a nivel de segmento: ningún `ADMIN`, `COLABORADOR` ni `SOLICITANTE` accede a
// estas rutas. El chequeo fino de cada acción vive además en los casos de uso.
export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol(Rol.SUPERADMIN);

  return <div className="mx-auto w-full max-w-3xl flex-1 p-6 md:p-8">{children}</div>;
}
