import Image from "next/image";
import Link from "next/link";
import { AppSidebarNav } from "./app-sidebar-nav";
import type { NavSection } from "./navConfig";

type Props = {
  sections: NavSection[];
  homeHref: string;
  ariaLabel: string;
  // El cluster de sesión (nombre/email + cerrar sesión) se renderiza en el
  // server (AppShell) y se inyecta como slot para no exponer la sesión al cliente.
  slotSesion: React.ReactNode;
};

// Sidebar del espacio logeado (feature 021, generalizado desde el panel de admin
// 008). Renderiza wordmark + secciones + cluster de sesión al pie. La navegación
// interactiva (activo por pathname) la resuelve `AppSidebarNav` (client). Se
// comparte fondo con el main (spec: sidebars no fragmentan el espacio), separado
// solo por un hairline `border-r`.
export function AppSidebar({ sections, homeHref, ariaLabel, slotSesion }: Props) {
  return (
    <aside
      aria-label={ariaLabel}
      className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-background md:sticky md:top-0 md:flex"
    >
      <div className="flex flex-col gap-8 px-4 py-6">
        {/* Wordmark con línea ocre continua, misma treatment que el navbar. */}
        <Link
          href={homeHref}
          className="focus-ring inline-flex items-center gap-3 px-2 leading-none"
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
          <span className="relative pb-[3px] font-serif text-sm leading-none tracking-tight text-foreground">
            <span className="italic text-foreground/60">Unidos por</span>{" "}
            <span className="font-semibold">la Guaira</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
            />
          </span>
        </Link>

        <AppSidebarNav sections={sections} />
      </div>

      {/* Cluster de sesión al pie. */}
      <div className="mt-auto flex flex-col gap-3 border-t border-border px-4 py-4">
        {slotSesion}
      </div>
    </aside>
  );
}
