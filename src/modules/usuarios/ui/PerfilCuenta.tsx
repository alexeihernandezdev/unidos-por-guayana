import type { CSSProperties } from "react";
import { KeyRound, UserRound } from "lucide-react";
import { CambiarPasswordForm } from "./CambiarPasswordForm";
import { DatosCuentaForm, type CamposDatosCuenta } from "./DatosCuentaForm";

type Props = {
  valoresIniciales: CamposDatosCuenta;
  actualizarDatosAction: (
    input: CamposDatosCuenta,
  ) => Promise<{ ok: boolean; error?: string }>;
  cambiarPasswordAction: (input: {
    passwordActual: string;
    passwordNueva: string;
  }) => Promise<{ ok: boolean; error?: string }>;
};

/**
 * Contenido del perfil de una cuenta base (SUPERADMIN / AUDITOR, feature 035):
 * identidad (nombre + correo) y seguridad (cambio de contraseña), cada una en su
 * propia superficie. Reutiliza el patrón visual de `/mi-perfil`.
 */
export function PerfilCuenta({
  valoresIniciales,
  actualizarDatosAction,
  cambiarPasswordAction,
}: Props) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <section
        className="panel-rise profile-surface"
        style={{ "--rise-delay": "40ms" } as CSSProperties}
      >
        <div className="profile-section-heading">
          <span className="profile-icon">
            <UserRound aria-hidden="true" />
          </span>
          <div>
            <h2>Identidad</h2>
            <p>El nombre y el correo con los que te identificas en el sistema.</p>
          </div>
        </div>
        <DatosCuentaForm
          valoresIniciales={valoresIniciales}
          action={actualizarDatosAction}
        />
      </section>

      <section
        className="panel-rise profile-surface"
        style={{ "--rise-delay": "90ms" } as CSSProperties}
      >
        <div className="profile-section-heading">
          <span className="profile-icon">
            <KeyRound aria-hidden="true" />
          </span>
          <div>
            <h2>Contraseña</h2>
            <p>Cámbiala cuando quieras; necesitarás la contraseña actual.</p>
          </div>
        </div>
        <CambiarPasswordForm action={cambiarPasswordAction} />
      </section>
    </div>
  );
}
