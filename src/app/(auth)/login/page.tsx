import Link from "next/link";
import { AuthShell } from "@/modules/usuarios/ui/AuthShell";
import { LoginForm } from "@/modules/usuarios/ui/LoginForm";
import { iniciarSesionAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registrado?: string; retorno?: string }>;
}) {
  const { registrado, retorno } = await searchParams;
  const retornoSeguro = retorno === "/mis-testimonios" ? retorno : undefined;

  return (
    <AuthShell
      title="Qué bueno tenerte de vuelta."
      footer={
        <p>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="auth-inline-link focus-ring">
            Crear una cuenta
          </Link>
        </p>
      }
    >
      {registrado === "admin" ? (
        <p className="auth-notice mb-6" role="status">
          Cuenta de administrador creada. Un superadministrador debe aprobarla
          antes de que puedas operar; te avisaremos al iniciar sesión.
        </p>
      ) : registrado ? (
        <p className="auth-success mb-6" role="status">
          Cuenta creada. Ya puedes iniciar sesión.
        </p>
      ) : null}

      <LoginForm action={iniciarSesionAction.bind(null, retornoSeguro)} />
    </AuthShell>
  );
}
