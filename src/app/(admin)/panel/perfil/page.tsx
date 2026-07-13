import type { Metadata } from "next";
import { MapPinned, ShieldCheck, UserRound } from "lucide-react";
import {
  PanelPage,
  PanelPageHeader,
  PanelSectionTabs,
} from "@/shared/ui/panel";
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
    <PanelPage>
      <PanelPageHeader
        icon={UserRound}
        eyebrow="Cuenta administradora"
        title="Mi perfil"
        description="Mantén actualizados los datos con los que tu organización se identifica y recibe contacto."
      />

      <PanelSectionTabs
        ariaLabel="Configuración administrativa"
        activo="/panel/perfil"
        items={[
          { href: "/panel/perfil", label: "Mi perfil", icon: UserRound },
          {
            href: "/panel/puntos-acopio",
            label: "Puntos de acopio",
            icon: MapPinned,
          },
        ]}
      />

      {datos ? (
        <section className="profile-surface mx-auto w-full max-w-3xl">
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
    </PanelPage>
  );
}
