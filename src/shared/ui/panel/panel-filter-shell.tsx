"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

// Marco de listado con filtros en un sidebar (feature panel · impacto visual).
// Sustituye al toolbar horizontal por una columna sticky de filtros a la izquierda
// (form GET) + el contenido a la derecha. En < lg el sidebar colapsa detrás de un
// botón "Filtros" para no comerse la pantalla. El formulario GET envuelve solo los
// filtros; el listado va fuera y lo re-renderiza el server con los searchParams.

type Props = {
  /** Campos del filtro (PanelFiltersField / FiltroUbicacion / inputs ocultos). */
  filtros: React.ReactNode;
  /** Listado o contenido principal a la derecha del sidebar. */
  children: React.ReactNode;
  titulo?: string;
  /** Resumen bajo el título (p. ej. "12 resultados"). */
  resumen?: React.ReactNode;
  /** Cuántos filtros activos; con > 0 se ofrece "Limpiar" y se muestra el conteo. */
  activos?: number;
  /** Ruta del índice sin filtros, destino de "Limpiar". */
  limpiarHref?: string;
  submitLabel?: string;
  className?: string;
};

export function PanelFilterShell({
  filtros,
  children,
  titulo = "Filtros",
  resumen,
  activos = 0,
  limpiarHref,
  submitLabel = "Aplicar",
  className,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [pendiente, startTransition] = useTransition();

  // Navegación suave (RSC) en vez de submit nativo: filtra en el servidor sin
  // recargar la página. Preserva el shell (sidebar), el scroll y la URL
  // compartible. Los selects y Enter disparan `requestSubmit()`, que pasa por
  // este `onSubmit`. Sin JS, el `<form method="get">` sigue funcionando (fallback).
  const alEnviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const params = new URLSearchParams();
    for (const [clave, valor] of datos.entries()) {
      if (typeof valor === "string") params.append(clave, valor);
    }
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  return (
    <div
      className={cn(
        "grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start",
        className,
      )}
    >
      {/* Disparador móvil: el sidebar se oculta tras un botón para no ocupar toda
          la pantalla en pantallas pequeñas. */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setAbierto((o) => !o)}
        aria-expanded={abierto}
        aria-controls="panel-filtros"
        className="w-full justify-between lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal strokeWidth={1.5} className="size-4" />
          {titulo}
          {activos > 0 && (
            <span className="numeric-tnum rounded-full bg-primary/15 px-1.5 font-mono text-xs text-primary-ink">
              {activos}
            </span>
          )}
        </span>
        <ChevronDown
          strokeWidth={1.5}
          className={cn(
            "size-4 transition-transform duration-200",
            abierto && "rotate-180",
          )}
        />
      </Button>

      <aside
        id="panel-filtros"
        className={cn("lg:sticky lg:top-6", !abierto && "hidden lg:block")}
      >
        <form
          method="get"
          data-autosubmit
          onSubmit={alEnviar}
          className="panel-surface flex flex-col gap-4 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2.5">
            <span className="panel-icon-chip" aria-hidden>
              <SlidersHorizontal aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none tracking-tight">
                {titulo}
              </p>
              {resumen != null && (
                <p className="numeric-tnum mt-1.5 font-mono text-xs text-muted-foreground">
                  {resumen}
                </p>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="flex flex-col gap-4">{filtros}</div>

          {/* Los filtros se aplican al cambiar (auto-submit de los selects); este
              submit queda oculto para conservar el envío con Enter desde los
              campos de texto y el acceso por teclado/lector de pantalla. */}
          <button type="submit" className="sr-only">
            {submitLabel}
          </button>

          {limpiarHref && activos > 0 && (
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href={limpiarHref}>Limpiar filtros</Link>
            </Button>
          )}
        </form>
      </aside>

      <div
        aria-busy={pendiente}
        className={cn(
          "min-w-0 transition-opacity duration-200",
          pendiente && "pointer-events-none opacity-60",
        )}
      >
        {children}
      </div>
    </div>
  );
}
