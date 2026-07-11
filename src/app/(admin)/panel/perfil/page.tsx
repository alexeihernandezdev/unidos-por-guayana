import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned, ShieldCheck, UserRound } from "lucide-react";
import type { DatosPerfilAdmin } from "@/modules/usuarios/domain/PerfilAdmin";
import { PerfilAdminForm } from "@/modules/usuarios/ui/PerfilAdminForm";
import { obtenerPerfilAdminGestion, requireAdminVerificado } from "@/shared/auth";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { actualizarPerfilAction } from "./actions";

export const metadata: Metadata = {
  title: "Mi perfil | Unidos por la Guaira",
};

// Perfil del centro de acopio del ADMIN (feature 016): ver y editar los datos
// ampliados de la cuenta. Requiere un ADMIN verificado (guard de segmento del
// route group (admin); se reafirma aquí para obtener el id de sesión).
export default async function PerfilAdminPage() {
  const sesion = await requireAdminVerificado();
  const perfil = await obtenerPerfilAdminGestion(sesion.id);
  const { estados, municipios } = await cargarCatalogoUbicacion();

  const datos: DatosPerfilAdmin | null = perfil
    ? {
        nombreCuenta: perfil.nombreCuenta,
        estadoId: perfil.estadoId,
        municipioId: perfil.municipioId,
        telefono: perfil.telefono,
        telefonoEsWhatsApp: perfil.telefonoEsWhatsApp,
        correo: perfil.correo,
        tipoDocumento: perfil.tipoDocumento,
        numeroDocumento: perfil.numeroDocumento,
      }
    : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-7 p-5 md:p-8 lg:p-10">
      <header className="rounded-xl bg-primary-ink px-6 py-7 text-primary-foreground md:px-8">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10"><UserRound className="size-5" aria-hidden="true" /></span>
          <div><p className="mb-1 text-sm text-white/70">Cuenta administradora</p><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Mi perfil</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Mantén actualizados los datos con los que tu organización se identifica y recibe contacto.</p></div>
        </div>
      </header>

      <nav aria-label="Configuración administrativa" className="flex gap-2 overflow-x-auto border-b pb-3">
        <Link href="/panel/perfil" className="profile-section-link bg-muted text-foreground"><UserRound />Mi perfil</Link>
        <Link href="/panel/puntos-acopio" className="profile-section-link"><MapPinned />Puntos de acopio</Link>
      </nav>

      {datos ? (
        <section className="profile-surface max-w-3xl">
          <div className="profile-section-heading"><span className="profile-icon"><ShieldCheck aria-hidden="true" /></span><div><h2>Identidad y contacto</h2><p>La información que verán los colaboradores al consultar tu centro.</p></div></div>
          <PerfilAdminForm
          perfil={datos}
          action={actualizarPerfilAction}
          estados={estados}
          municipios={municipios}
          />
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          Tu cuenta aún no tiene un perfil de centro de acopio. Contacta con la
          organización para completarlo.
        </p>
      )}
    </main>
  );
}
