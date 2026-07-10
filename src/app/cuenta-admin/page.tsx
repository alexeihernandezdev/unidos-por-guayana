import Link from "next/link";
import { redirect } from "next/navigation";
import { EstadoVerificacion, Rol } from "@/modules/usuarios/domain/Rol";
import { buscarUsuarioPorId, requireSesion } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import { Button } from "@/shared/ui/button";

// Estado de una cuenta de administrador registrada públicamente (feature 015).
// Aquí aterriza un ADMIN que aún no puede operar: el guard `requireAdminVerificado`
// redirige a esta ruta cuando la cuenta está en PENDIENTE o RECHAZADO. Un ADMIN ya
// VERIFICADO se envía al panel; cualquier otro rol, al inicio.
export default async function CuentaAdminPage() {
  const sesion = await requireSesion();
  if (sesion.rol !== Rol.ADMIN) redirect("/");

  const usuario = await buscarUsuarioPorId(sesion.id);
  const estado = usuario?.estadoVerificacion ?? EstadoVerificacion.PENDIENTE;

  if (estado === EstadoVerificacion.VERIFICADO) redirect("/panel");

  const rechazada = estado === EstadoVerificacion.RECHAZADO;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <span
        aria-hidden
        className={
          rechazada
            ? "size-2.5 rounded-full bg-destructive"
            : "size-2.5 rounded-full bg-primary"
        }
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {rechazada
            ? "Tu cuenta de administrador fue rechazada"
            : "Tu cuenta está pendiente de aprobación"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {rechazada
            ? "Un superadministrador ha revisado tu solicitud y no la ha aprobado. Si crees que es un error, ponte en contacto con la organización."
            : "Registramos tu cuenta como administrador. Un superadministrador debe aprobarla antes de que puedas crear envíos, recursos o gestionar aportes. Vuelve a intentarlo más tarde."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Volver al inicio</Link>
        </Button>
        <form action={cerrarSesionAction}>
          <Button type="submit" size="sm" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </main>
  );
}
