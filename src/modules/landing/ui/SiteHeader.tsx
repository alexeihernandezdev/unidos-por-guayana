import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-8">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-3 leading-none"
          aria-label="Unidos por Guayana, ir al inicio"
        >
          <Image
            src="/logo-mark.svg"
            alt=""
            width={28}
            height={28}
            priority
            className="h-7 w-7"
          />
          <span className="text-base font-semibold tracking-tight text-foreground">
            Unidos por Guayana
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-8 md:flex"
        >
          <Link
            href="#envios"
            className="focus-ring underline-sweep text-sm text-foreground/75 transition-colors duration-150 hover:text-foreground"
          >
            Envíos
          </Link>
          <Link
            href="#como-funciona"
            className="focus-ring underline-sweep text-sm text-foreground/75 transition-colors duration-150 hover:text-foreground"
          >
            Cómo funciona
          </Link>
          <Link
            href="#transparencia"
            className="focus-ring underline-sweep text-sm text-foreground/75 transition-colors duration-150 hover:text-foreground"
          >
            Transparencia
          </Link>
        </nav>

        <Link
          href="/login"
          className="focus-ring underline-sweep text-sm text-foreground/80 transition-colors duration-150 hover:text-accent"
        >
          Ya tengo cuenta
        </Link>
      </div>
    </header>
  );
}
