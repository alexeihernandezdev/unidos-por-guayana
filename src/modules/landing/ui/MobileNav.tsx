"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { NavLink } from "./NavLink";
import type { NavItem } from "./navConfig";

type Props = {
  items: NavItem[];
  // Server-rendered auth cluster (CTAs de login/registro o info de sesión). Se
  // renderiza también en el panel móvil sin duplicar lógica en el cliente.
  slotAuth: React.ReactNode;
};

/**
 * Toggle + panel móvil. El panel desliza desde la base del header con
 * transform + opacity (no anima layout, se acelera en GPU). Cierra al navegar,
 * al pulsar Escape o al hacer click fuera; bloquea el scroll del body cuando
 * está abierto. Respeta `prefers-reduced-motion` degradando a fade instantáneo.
 */
export function MobileNav({ items, slotAuth }: Props) {
  const [open, setOpen] = useState(false);

  // El cierre al navegar lo dispara cada NavLink con `onNavigate={cerrar}`; el
  // Escape y el click fuera del panel cierran por sus propios listeners. No hace
  // falta observar `pathname` (React 19 desaconseja `setState` dentro de effects).

  // Bloquear scroll del body mientras el panel está abierto.
  useEffect(() => {
    if (!open) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [open]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const cerrar = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="site-mobile-nav"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="focus-ring -mr-2 inline-flex size-10 items-center justify-center rounded-md text-foreground/80 transition-colors duration-150 hover:text-accent"
      >
        {open ? (
          <X strokeWidth={1.5} className="size-5" />
        ) : (
          <Menu strokeWidth={1.5} className="size-5" />
        )}
      </button>

      {/* Backdrop invisible para capturar clicks fuera del panel. */}
      {open && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={cerrar}
          className="fixed inset-0 top-16 z-20 cursor-default bg-transparent"
        />
      )}

      {/* Panel deslizante desde debajo del header (top-16). */}
      <div
        id="site-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 top-16 z-30 origin-top border-b border-border bg-background",
          "shadow-[0_12px_24px_-16px_rgba(0,0,0,0.15)]",
          "transition-transform duration-200 [transition-timing-function:var(--ease-out-emil)]",
          "motion-reduce:transition-none",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
        style={{ transitionProperty: "transform, opacity" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-6 md:px-8">
          {items.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              Sin secciones adicionales para tu rol.
            </p>
          ) : (
            <nav
              aria-label="Navegación principal (móvil)"
              className="flex flex-col divide-y divide-border/60"
            >
              {items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  exact={item.exact}
                  onNavigate={cerrar}
                  className="w-full justify-between py-3 text-base"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            {slotAuth}
          </div>
        </div>
      </div>
    </div>
  );
}
