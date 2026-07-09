import { getUsuarioActual } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import { LogOutIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";

// Shell del panel de administrador. Server component: renderiza el sidebar
// (server + client interactivo dentro), el topbar móvil con Sheet, y una
// zona `main` que hospeda el contenido. Sidebar y main comparten background
// (spec: "sidebars: mismo background que canvas, borde suficiente separación").
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioActual();

  // Cluster de sesión: se renderiza en el server y se inyecta al Sheet móvil
  // como slot, evitando duplicar lógica de sesión en el cliente.
  const clusterSesion = (
    <>
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
    </>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col md:flex-row">
      <Sidebar />

      {/* Topbar móvil: solo visible < md. Ancla el hamburguesa + wordmark. */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <MobileSidebar slotSesion={clusterSesion} />
        <span className="relative pb-[2px] font-serif text-sm leading-none tracking-tight">
          <span className="italic text-foreground/60">Unidos por</span>{" "}
          <span className="font-semibold">Guayana</span>
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
          />
        </span>
        <span className="size-10" aria-hidden />
      </div>

      <main className="flex min-w-0 flex-1 flex-col bg-background">
        {children}
      </main>
    </div>
  );
}
