import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import { Button } from "@/shared/ui/button";

// Ruta de ejemplo solo para ADMIN. Doble barrera:
// 1. `proxy.ts` redirige a /login si no hay sesión (protección de ruta).
// 2. `requireRol(ADMIN)` bloquea a COLABORADOR/SOLICITANTE (gate por rol).
// El panel real es la feature 008; aquí solo se demuestra el control de acceso.
export default async function PanelPage() {
  const usuario = await requireRol(Rol.ADMIN);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Panel de administración</h1>
      <p className="max-w-md text-muted-foreground">
        Hola {usuario.nombre ?? usuario.email}. Esta ruta solo es accesible para
        el rol <span className="font-medium">ADMIN</span>.
      </p>
      <form action={cerrarSesionAction}>
        <Button type="submit" variant="outline">
          Cerrar sesión
        </Button>
      </form>
    </main>
  );
}
