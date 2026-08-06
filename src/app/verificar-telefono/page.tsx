import { redirect } from "next/navigation";
import { AuthShell } from "@/modules/usuarios/ui/AuthShell";
import { VerificarTelefonoForm } from "@/modules/usuarios/ui/VerificarTelefonoForm";
import { requireSesion } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import {
  estadoVerificacionTelefonoServicio,
  telefonoPendienteServicio,
} from "@/shared/verificacion-telefono";
import {
  cancelarCambioAction,
  confirmarCodigoAction,
  enviarCodigoAction,
  reenviarCodigoAction,
} from "./actions";

export default async function VerificarTelefonoPage() {
  const usuario = await requireSesion();
  if (!(await telefonoPendienteServicio(usuario.id))) redirect("/inicio");
  const estado = await estadoVerificacionTelefonoServicio(usuario.id);

  return (
    <AuthShell
      eyebrow="Seguridad de contacto"
      title="Confirma tu teléfono."
      description="Usaremos WhatsApp para comprobar que puedes recibir mensajes en este número."
      footer={
        <form action={cerrarSesionAction}>
          <button className="auth-inline-link focus-ring" type="submit">
            Cerrar sesión y hacerlo más tarde
          </button>
        </form>
      }
    >
      <VerificarTelefonoForm
        telefonoEnmascarado={estado?.telefonoEnmascarado}
        ahoraInicial={new Date().toISOString()}
        expiraEn={estado?.expiraEn.toISOString()}
        reenvioEn={estado?.reenvioEn.toISOString()}
        cancelable={estado?.cancelable ?? false}
        enviar={enviarCodigoAction}
        reenviar={reenviarCodigoAction}
        confirmar={confirmarCodigoAction}
        cancelar={cancelarCambioAction}
      />
    </AuthShell>
  );
}
