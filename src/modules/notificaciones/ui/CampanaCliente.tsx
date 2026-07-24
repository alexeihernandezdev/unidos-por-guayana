"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { BellIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { marcarTodasLeidasAction } from "./acciones";

// Vista serializable de una notificación para los componentes cliente.
export type NotificacionVista = {
  id: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  href: string;
};

type Props = {
  noLeidas: number;
  items: NotificacionVista[];
};

/**
 * Campana de la cabecera (feature 012): botón con badge de no leídas y popover con
 * las últimas notificaciones. El popover abre desde el trigger (transform-origin del
 * propio disparador) con la animación estándar de ShadCN (respeta reduced-motion).
 */
export function CampanaCliente({ noLeidas, items }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();

  const marcarTodas = () => {
    startTransition(async () => {
      await marcarTodasLeidasAction();
      router.refresh();
    });
  };

  return (
    <Popover>
      <PopoverTrigger
        aria-label={
          noLeidas > 0
            ? `Notificaciones, ${noLeidas} sin leer`
            : "Notificaciones"
        }
        className="focus-ring relative inline-flex size-9 items-center justify-center rounded-md text-foreground/75 transition-colors duration-150 hover:bg-sidebar-accent hover:text-foreground"
      >
        <BellIcon strokeWidth={1.5} className="size-5" />
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground numeric-tnum">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-sm font-medium">Notificaciones</span>
          {noLeidas > 0 && (
            <button
              type="button"
              onClick={marcarTodas}
              disabled={pendiente}
              className="focus-ring rounded text-xs text-primary-ink hover:underline disabled:opacity-60"
            >
              Marcar todas
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No tienes notificaciones.
          </p>
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className="flex gap-2.5 px-3 py-3 transition-colors duration-150 hover:bg-sidebar-accent"
                >
                  <span
                    aria-hidden
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                      n.leida ? "bg-transparent" : "bg-primary"
                    }`}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm text-foreground/90">
                      {n.mensaje}
                    </span>
                    <span className="font-mono numeric-tnum text-xs text-muted-foreground">
                      {n.fecha}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-border px-3 py-2">
          <Link
            href="/notificaciones"
            className="focus-ring block rounded text-center text-sm text-primary-ink hover:underline"
          >
            Ver todas
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
