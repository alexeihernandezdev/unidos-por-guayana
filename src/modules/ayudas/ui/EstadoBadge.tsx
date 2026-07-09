import type { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { cn } from "@/shared/lib/utils";
import { ESTADO_BADGE, ESTADO_LABEL } from "./estados";

type Props = {
  estado: EstadoAyuda;
  className?: string;
};

// Píldora que muestra la etapa del ciclo de vida de una Ayuda.
export function EstadoBadge({ estado, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        ESTADO_BADGE[estado],
        className,
      )}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}
