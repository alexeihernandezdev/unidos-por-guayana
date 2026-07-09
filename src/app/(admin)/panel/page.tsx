import Link from "next/link";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import { Button } from "@/shared/ui/button";

// Panel del ADMIN. Doble barrera:
// 1. `proxy.ts` redirige a /login si no hay sesión (protección de ruta).
// 2. `requireRol(ADMIN)` bloquea a COLABORADOR/SOLICITANTE (gate por rol).
// El tablero completo es la feature 008; aquí se listan los módulos ya
// disponibles para la gestión.
export default async function PanelPage() {
  const usuario = await requireRol(Rol.ADMIN);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Panel de administración
          </h1>
          <p className="text-muted-foreground">
            Hola {usuario.nombre ?? usuario.email}.
          </p>
        </div>
        <form action={cerrarSesionAction}>
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <div className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
        <Link
          href="/panel/solicitudes"
          className="focus-ring flex flex-col gap-1 rounded-lg border border-border p-5 transition-colors hover:bg-accent/10"
        >
          <span className="font-medium">Solicitudes de ayuda</span>
          <span className="text-sm text-muted-foreground">
            Revisa las peticiones del terreno por sector, urgencia y estado para
            decidir qué envío crear a continuación.
          </span>
        </Link>
        <Link
          href="/panel/ayudas"
          className="focus-ring flex flex-col gap-1 rounded-lg border border-border p-5 transition-colors hover:bg-accent/10"
        >
          <span className="font-medium">Envíos de ayuda</span>
          <span className="text-sm text-muted-foreground">
            Crea envíos con sus metas por recurso, gestiona destino y fecha, y
            hazlos avanzar de Recolectando a Entregado.
          </span>
        </Link>
        <Link
          href="/panel/recursos"
          className="focus-ring flex flex-col gap-1 rounded-lg border border-border p-5 transition-colors hover:bg-accent/10"
        >
          <span className="font-medium">Catálogo de recursos</span>
          <span className="text-sm text-muted-foreground">
            Crea, edita y archiva los recursos (agua, transporte, personal,
            monetario) sobre los que se miden metas y aportes.
          </span>
        </Link>
      </div>
    </main>
  );
}
