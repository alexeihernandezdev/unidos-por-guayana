import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import {
  BandejaAdmins,
  type AdminPendiente,
} from "@/modules/usuarios/ui/BandejaAdmins";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
import {
  listarAdminsPendientesGestion,
  obtenerPerfilAdminGestion,
  requireRol,
} from "@/shared/auth";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { aprobarAdminAction, rechazarAdminAction } from "./actions";

export const metadata: Metadata = {
  title: "Aprobación de administradores | Unidos por la Guaira",
};

// Bandeja del superadministrador (features 015 + 016). Lista las cuentas `ADMIN`
// en `PENDIENTE` con su perfil de centro de acopio y permite aprobarlas (pasan a
// operar) o rechazarlas. El layout del segmento ya exige rol `SUPERADMIN`; se
// reafirma aquí para pasar el actor al caso de uso, que aplica el doble candado.
export default async function AprobacionAdminsPage() {
  const sesion = await requireRol(Rol.SUPERADMIN);
  const admins = await listarAdminsPendientesGestion({ rol: sesion.rol });

  // Catálogo para resolver los nombres de estado/municipio del perfil (que guarda
  // ids, feature 020).
  const { estados, municipios } = await cargarCatalogoUbicacion();
  const nombreEstado = new Map(estados.map((e) => [e.id, e.nombre]));
  const nombreMunicipio = new Map(municipios.map((m) => [m.id, m.nombre]));

  const pendientes: AdminPendiente[] = await Promise.all(
    admins.map(async (admin) => {
      const perfil = await obtenerPerfilAdminGestion(admin.id);
      const ubicacion = perfil
        ? {
            estado: nombreEstado.get(perfil.estadoId) ?? "—",
            municipio: nombreMunicipio.get(perfil.municipioId) ?? "—",
          }
        : null;
      return { admin, perfil, ubicacion };
    }),
  );

  return (
    <PanelPage>
      <PanelPageHeader
        icon={ShieldCheck}
        eyebrow="Aprobaciones"
        title="Aprobación de administradores"
        description="Revisa las cuentas que se registraron como administrador. Al aprobar, la cuenta podrá operar como centro de acopio; al rechazar, queda bloqueada."
      />

      <BandejaAdmins
        pendientes={pendientes}
        aprobarAction={aprobarAdminAction}
        rechazarAction={rechazarAdminAction}
      />
    </PanelPage>
  );
}
