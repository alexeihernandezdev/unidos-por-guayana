import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, LogOutIcon } from "lucide-react";
import { cerrarSesionAction } from "@/shared/auth/actions";

type Props = {
  // Destino del enlace "Ir a mi panel", calculado con `rutaInicioPorRol`.
  rutaPanel: string;
};

/**
 * Barra mínima para usuarios con sesión en páginas públicas (landing y
 * transparencia). El navbar global (`SiteHeader`) se oculta al haber sesión
 * (feature 021), así que estas páginas quedarían sin salida hacia el espacio de
 * trabajo. Esta banda —no el navbar completo— ofrece "Ir a mi panel" + cerrar
 * sesión, sin las secciones de navegación de visitante.
 */
export function VolverAlPanelHeader({ rutaPanel }: Props) {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center gap-4 px-6 md:px-8">
        <Link
          href={rutaPanel}
          className="focus-ring inline-flex shrink-0 items-center gap-2 leading-none"
          aria-label="Ir a mi panel"
        >
          <Image
            src="/logo-mark.svg"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
          <span className="relative pb-[2px] font-serif text-sm leading-none tracking-tight text-foreground">
            <span className="italic text-foreground/60">Unidos por</span>{" "}
            <span className="font-semibold">la Guaira</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
            />
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <Link
            href={rutaPanel}
            className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors duration-150 hover:text-accent/80"
          >
            Ir a mi panel
            <ArrowRightIcon strokeWidth={1.5} className="size-4" />
          </Link>
          <form action={cerrarSesionAction}>
            <button
              type="submit"
              className="focus-ring inline-flex items-center gap-1.5 text-sm text-foreground/70 transition-colors duration-150 hover:text-accent"
            >
              <LogOutIcon strokeWidth={1.5} className="size-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
