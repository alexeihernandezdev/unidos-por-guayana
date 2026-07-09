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
 * Identidad: wordmark serif con una línea ocre continua debajo, tal como pide
 * tech-stack.md § "Estilo visual / Sistema de color / tokens" ("trazos de
 * identidad, línea bajo el nombre en el SiteHeader"). Ocre = marca; teal =
 * interacción; neutrales para todo lo demás.
 */
export async function SiteHeader() {
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
      <Button asChild variant="ghost" size="sm" className="focus-ring">
        <Link href="/login">Iniciar sesión</Link>
      </Button>
      <Button asChild size="sm" className="focus-ring">
        <Link href="/registro">Crear cuenta</Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center gap-6 px-6 md:gap-10 md:px-8">
        {/* Wordmark: serif italic + serif semibold con línea ocre continua. */}
        <Link
          href="/"
          className="focus-ring inline-flex shrink-0 items-center gap-3 leading-none"
          aria-label="Unidos por Guayana, ir al inicio"
        >
          <Image
            src="/logo-mark.svg"
            alt=""
            width={28}
            height={28}
            priority
            className="h-7 w-7 shrink-0"
          />
          <span className="relative pb-[3px] font-serif text-base leading-none tracking-tight text-foreground">
            <span className="italic text-foreground/60">Unidos por</span>{" "}
            <span className="font-semibold">Guayana</span>
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
