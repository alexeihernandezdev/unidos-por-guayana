"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCheckIcon, CheckIcon } from "lucide-react";
import { marcarLeidaAction, marcarTodasLeidasAction } from "./acciones";
import type { NotificacionVista } from "./CampanaCliente";

type Props = {
  items: NotificacionVista[];
};

/**
 * Bandeja de notificaciones (feature 012): lista en row-cards con enlace a la
 * referencia, marca individual y "marcar todas como leídas". Tras cada acción se
 * refresca la ruta para reflejar el nuevo estado y el contador de la campana.
 */
export function NotificacionesLista({ items }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const hayNoLeidas = items.some((n) => !n.leida);

  const marcarUna = (id: string) => {
    startTransition(async () => {
      await marcarLeidaAction(id);
      router.refresh();
    });
  };

  const marcarTodas = () => {
    startTransition(async () => {
      await marcarTodasLeidasAction();
      router.refresh();
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No tienes notificaciones por ahora.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {hayNoLeidas && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={marcarTodas}
            disabled={pendiente}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-primary-ink transition-colors duration-150 hover:bg-primary/[0.06] disabled:opacity-60"
          >
            <CheckCheckIcon strokeWidth={1.5} className="size-4" />
            Marcar todas como leídas
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {items.map((n) => (
          <li
            key={n.id}
            className={`flex items-start gap-3 rounded-lg border p-4 transition-colors duration-150 ${
              n.leida
                ? "border-border"
                : "border-primary/30 bg-primary/[0.035]"
            }`}
          >
            <span
              aria-hidden
              className={`mt-1.5 size-2 shrink-0 rounded-full ${
                n.leida ? "bg-transparent" : "bg-primary"
              }`}
            />
            <Link
              href={n.href}
              className="focus-ring flex flex-1 flex-col gap-1 rounded"
            >
              <span className="text-sm text-foreground/90">{n.mensaje}</span>
              <span className="font-mono numeric-tnum text-xs text-muted-foreground">
                {n.fecha}
              </span>
            </Link>
            {!n.leida && (
              <button
                type="button"
                onClick={() => marcarUna(n.id)}
                disabled={pendiente}
                aria-label="Marcar como leída"
                title="Marcar como leída"
                className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md text-foreground/60 transition-colors duration-150 hover:bg-sidebar-accent hover:text-foreground disabled:opacity-60"
              >
                <CheckIcon strokeWidth={1.5} className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
