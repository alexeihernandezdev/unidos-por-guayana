import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { LogOutIcon } from "lucide-react";
import { getUsuarioActual } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import { AppSidebarNav } from "./app-sidebar-nav";
import type { NavSection } from "./navConfig";

type Props = {
  sections: NavSection[];
  homeHref: string;
  ariaLabel: string;
  children: React.ReactNode;
};

// Shell del espacio logeado (feature 021, generalizado desde `AdminShell` 008).
// La navegación principal usa el Sidebar de ShadCN: colapsable (`offcanvas`) para
// aprovechar todo el ancho, con el estado persistido en cookie y renderizado como
// Sheet en móvil de forma automática. El toggle vive en la barra superior
// (`SidebarTrigger`). El mismo shell sirve a ADMIN, SUPERADMIN, COLABORADOR y
// SOLICITANTE, parametrizado por `sections`/`homeHref`/`ariaLabel`.
export async function AppShell({
  sections,
  homeHref,
  ariaLabel,
  children,
}: Props) {
  const usuario = await getUsuarioActual();

  // Estado inicial del sidebar desde la cookie (evita parpadeo en SSR); patrón
  // recomendado por ShadCN. Abierto por defecto si no hay cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const wordmark = (
    <span className="relative pb-[2px] font-serif text-sm leading-none tracking-tight group-data-[collapsible=icon]:hidden">
      <span className="italic text-foreground/60">Unidos por</span>{" "}
      <span className="font-semibold">la Guaira</span>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
      />
    </span>
  );

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            href={homeHref}
            className="focus-ring flex items-center gap-2.5 rounded-md px-2 py-1.5 leading-none"
            aria-label={ariaLabel}
          >
            <Image
              src="/logo-mark.svg"
              alt=""
              width={24}
              height={24}
              priority
              className="h-6 w-6 shrink-0"
            />
            {wordmark}
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <AppSidebarNav sections={sections} />
        </SidebarContent>

        <SidebarFooter>
          {usuario && (
            <div className="flex flex-col gap-0.5 px-2 group-data-[collapsible=icon]:hidden">
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
              title="Cerrar sesión"
              className="focus-ring inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground/75 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <LogOutIcon strokeWidth={1.5} className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                Cerrar sesión
              </span>
            </button>
          </form>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Barra superior: ancla el toggle del sidebar y el contexto del espacio.
            Sticky para que el toggle siga a mano al hacer scroll. */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-md md:px-4">
          <SidebarTrigger className="-ml-1" />
          <div aria-hidden className="h-5 w-px bg-border" />
          <span className="truncate text-sm font-medium text-foreground/80">
            {ariaLabel}
          </span>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
