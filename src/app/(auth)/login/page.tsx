import Link from "next/link";
import { LoginForm } from "@/modules/usuarios/ui/LoginForm";
import { iniciarSesionAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registrado?: string }>;
}) {
  const { registrado } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-sm text-muted-foreground">
          Accede con tu email y contraseña.
        </p>
      </div>

      {registrado === "admin" ? (
        <p
          className="max-w-sm text-center text-sm text-muted-foreground"
          role="status"
        >
          Cuenta de administrador creada. Un superadministrador debe aprobarla
          antes de que puedas operar; te avisaremos al iniciar sesión.
        </p>
      ) : registrado ? (
        <p className="text-sm text-green-600 dark:text-green-500" role="status">
          Cuenta creada. Ya puedes iniciar sesión.
        </p>
      ) : null}

      <LoginForm action={iniciarSesionAction} />

      <p className="text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="text-primary underline-offset-4 hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </main>
  );
}
