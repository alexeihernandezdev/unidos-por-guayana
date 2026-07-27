import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { PerfilCuenta } from "@/modules/usuarios/ui/PerfilCuenta";
import { buscarUsuarioPorId, requireRol } from "@/shared/auth";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
import { actualizarDatosCuentaAction, cambiarPasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Mi perfil | Unidos por la Guaira",
};

// Perfil de la cuenta SUPERADMIN (feature 035): editar nombre, correo y
// contraseña. El guard de segmento ya exige rol SUPERADMIN; se reafirma aquí
// para obtener el id de sesión y leer los datos frescos de base.
export default async function PerfilSuperadminPage() {
  const sesion = await requireRol(Rol.SUPERADMIN);
  const usuario = await buscarUsuarioPorId(sesion.id);

  return (
    <PanelPage>
      <PanelPageHeader
        animated
        icon={UserRound}
        eyebrow="Cuenta superadministradora"
        title="Mi perfil"
        description="Actualiza tus datos de acceso: nombre, correo y contraseña."
      />

      <PerfilCuenta
        valoresIniciales={{
          nombre: usuario?.nombre ?? "",
          email: usuario?.email ?? "",
        }}
        actualizarDatosAction={actualizarDatosCuentaAction}
        cambiarPasswordAction={cambiarPasswordAction}
      />
    </PanelPage>
  );
}
