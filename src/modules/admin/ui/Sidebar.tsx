import Image from "next/image";
import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { getUsuarioActual } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import { ADMIN_NAV } from "./navConfig";
import { SidebarNav } from "./SidebarNav";

// Sidebar del panel de administrador. Server component: lee la sesión sin
// exponerla al cliente y renderiza el wordmark + secciones + chip de sesión.
// La navegación interactiva (activo por pathname) la resuelve `SidebarNav`.
// Se comparte fondo con el main (spec: sidebars no fragmentan el espacio),
// separado solo por un hairline `border-r`.
export async function Sidebar() {
  const usuario = await getUsuarioActual();

  return (
    <aside
      aria-label="Panel de administración"
      className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-background md:sticky md:top-0 md:flex"
    >
      <div className="flex flex-col gap-8 px-4 py-6">
        {/* Wordmark con línea ocre continua, misma treatment que el navbar. */}
        <Link
          href="/panel"
          className="focus-ring inline-flex items-center gap-3 px-2 leading-none"
          aria-label="Ir al panel de administración"
        >
          <Image
            src="/logo-mark.svg"
            alt=""
            width={24}
            height={24}
            priority
            className="h-6 w-6 shrink-0"
          />
          <span className="relative pb-[3px] font-serif text-sm leading-none tracking-tight text-foreground">
            <span className="italic text-foreground/60">Unidos por</span>{" "}
            <span className="font-semibold">Guayana</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
            />
          </span>
        </Link>

        <SidebarNav sections={ADMIN_NAV} />
      </div>

      {/* Cluster de sesión al pie. */}
      <div className="mt-auto flex flex-col gap-3 border-t border-border px-4 py-4">
        {usuario && (
          <div className="flex flex-col gap-0.5 px-2">
            <span className="truncate text-sm text-foreground/85">
              {usuario.nombre ?? usuario.email}
            </span>
            <span
              className="truncate text-xs text-muted-foreground"
              title={usuario.email ?? undefined}
            >
              {usuario.email}
            </span>
          </div>
        )}
        <form action={cerrarSesionAction}>
          <button
            type="submit"
            className="focus-ring inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/75 transition-colors duration-150 hover:bg-muted/50 hover:text-accent"
          >
            <LogOutIcon strokeWidth={1.5} className="size-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
