import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { PerfilCuenta } from "@/modules/usuarios/ui/PerfilCuenta";
import { buscarUsuarioPorId, requireAuditorActivo } from "@/shared/auth";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
import { actualizarDatosCuentaAction, cambiarPasswordAction } from "./actions";

export const metadata: Metadata = {
  title: "Mi perfil | Unidos por la Guaira",
};

// Perfil de la cuenta AUDITOR (feature 035): editar nombre, correo y contraseña.
// El layout (app) solo exige sesión; aquí se reafirma que sea un AUDITOR activo
// y se leen sus datos frescos de base.
export default async function PerfilAuditorPage() {
  const sesion = await requireAuditorActivo();
  const usuario = await buscarUsuarioPorId(sesion.id);

  return (
    <PanelPage>
      <PanelPageHeader
        animated
        icon={UserRound}
        eyebrow="Cuenta auditora"
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
