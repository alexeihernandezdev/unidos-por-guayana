import Image from "next/image";
import Link from "next/link";
import { getUsuarioActual } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import { Button } from "@/shared/ui/button";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";
import { RoleChip } from "./RoleChip";
import { navItemsPorRol } from "./navConfig";

/**
 * Navbar global. Se monta en `src/app/layout.tsx` para aparecer en toda la app,
 * y muestra secciones distintas según el rol de la sesión activa (ver
 * `navConfig.ts`). Es un server component: lee la sesión sin exponerla al
 * cliente y delega la interactividad del menú móvil a `MobileNav`.
 *
 * Identidad: wordmark serif con una línea ocre continua sobre una superficie
 * liquid-glass estratificada. El vidrio se resuelve en CSS para conservar este
 * componente en servidor y mantener un fallback opaco sin backdrop-filter.
 */
export async function SiteHeader({
  superpuesto = false,
}: {
  superpuesto?: boolean;
}) {
  const usuario = await getUsuarioActual();
  const items = navItemsPorRol(usuario?.rol ?? null);

  const clusterAuth = usuario ? (
    <div className="flex flex-wrap items-center gap-3">
      <RoleChip rol={usuario.rol} />
      <span
        className="text-sm text-foreground/80"
        title={usuario.email ?? undefined}
      >
        {usuario.nombre ?? usuario.email}
      </span>
      <form action={cerrarSesionAction}>
        <button
          type="submit"
          className="focus-ring underline-sweep text-sm text-foreground/70 transition-colors duration-150 hover:text-accent"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  ) : (
    <div className="flex items-center gap-2 sm:gap-3">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="focus-ring rounded-full bg-background/20 shadow-[inset_0_1px_0_rgb(255_255_255/0.28)] backdrop-blur-sm hover:bg-background/45"
      >
        <Link href="/login">Iniciar sesión</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="focus-ring rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.32),0_5px_16px_-8px_var(--primary)]"
      >
        <Link href="/registro">Crear cuenta</Link>
      </Button>
    </div>
  );

  return (
    <header
      className={
        "liquid-glass-surface sticky top-0 z-40 h-16 " +
        (superpuesto ? "-mb-16" : "")
      }
    >
      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center gap-6 px-6 md:gap-10 md:px-8">
        {/* Wordmark: serif italic + serif semibold con línea ocre continua. */}
        <Link
          href="/"
          className="focus-ring inline-flex shrink-0 items-center gap-3 leading-none"
          aria-label="Unidos por la Guaira, ir al inicio"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_5px_18px_-12px_var(--foreground)] backdrop-blur-sm">
            <Image
              src="/logo-mark.svg"
              alt=""
              width={24}
              height={24}
              priority
              className="size-6"
            />
          </span>
          <span className="relative pb-[3px] font-serif text-base leading-none tracking-tight text-foreground">
            <span className="italic text-foreground/60">Unidos por</span>{" "}
            <span className="font-semibold">la Guaira</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
            />
          </span>
        </Link>

        {/* Navegación principal (desktop). Vacía para visitantes sin sesión. */}
        {items.length > 0 && (
          <nav
            aria-label="Navegación principal"
            className="hidden h-full items-center gap-6 md:flex lg:gap-8"
          >
            {items.map((item) => (
              <NavLink key={item.href} href={item.href} exact={item.exact}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Cluster derecho: se estira para empujar auth/CTAs al final. */}
        <div className="ml-auto hidden items-center gap-4 md:flex">
          {clusterAuth}
        </div>

        {/* Menú móvil: se apila al final en < md. */}
        <div className="ml-auto md:hidden">
          <MobileNav items={items} slotAuth={clusterAuth} />
        </div>
      </div>
    </header>
  );
}
