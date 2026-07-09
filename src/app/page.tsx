import Link from "next/link";
import { getUsuarioActual } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import { Button } from "@/shared/ui/button";

export default async function Home() {
  const usuario = await getUsuarioActual();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Unidos por Guayana
      </h1>

      {usuario ? (
        <>
          <p className="max-w-md text-muted-foreground">
            Sesión iniciada como{" "}
            <span className="font-medium text-foreground">
              {usuario.nombre ?? usuario.email}
            </span>{" "}
            · rol <span className="font-medium text-foreground">{usuario.rol}</span>.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/panel">Ir al panel (solo ADMIN)</Link>
            </Button>
            <form action={cerrarSesionAction}>
              <Button type="submit">Cerrar sesión</Button>
            </form>
          </div>
        </>
      ) : (
        <>
          <p className="max-w-md text-muted-foreground">
            Coordina ayudas, aportes y solicitudes hacia Guayana. Inicia sesión o
            crea una cuenta para empezar.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/registro">Crear cuenta</Link>
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
