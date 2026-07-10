import type { Metadata } from "next";
import type { DatosPerfilAdmin } from "@/modules/usuarios/domain/PerfilAdmin";
import { PerfilAdminForm } from "@/modules/usuarios/ui/PerfilAdminForm";
import { obtenerPerfilAdminGestion, requireAdminVerificado } from "@/shared/auth";
import { actualizarPerfilAction } from "./actions";

export const metadata: Metadata = {
  title: "Mi perfil de centro de acopio | Unidos por Guayana",
};

// Perfil del centro de acopio del ADMIN (feature 016): ver y editar los datos
// ampliados de la cuenta. Requiere un ADMIN verificado (guard de segmento del
// route group (admin); se reafirma aquí para obtener el id de sesión).
export default async function PerfilAdminPage() {
  const sesion = await requireAdminVerificado();
  const perfil = await obtenerPerfilAdminGestion(sesion.id);

  const datos: DatosPerfilAdmin | null = perfil
    ? {
        nombreCuenta: perfil.nombreCuenta,
        estado: perfil.estado,
        parroquia: perfil.parroquia,
        telefono: perfil.telefono,
        correo: perfil.correo,
        tipoDocumento: perfil.tipoDocumento,
        numeroDocumento: perfil.numeroDocumento,
      }
    : null;

  return (
    <main className="flex flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Mi perfil de centro de acopio
        </h1>
        <p className="text-sm text-muted-foreground">
          Estos son los datos con los que tu cuenta se identifica en la red.
          Mantenlos al día para que el resto pueda contactarte y ubicarte.
        </p>
      </header>

      {datos ? (
        <PerfilAdminForm perfil={datos} action={actualizarPerfilAction} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          Tu cuenta aún no tiene un perfil de centro de acopio. Contacta con la
          organización para completarlo.
        </p>
      )}
    </main>
  );
}
