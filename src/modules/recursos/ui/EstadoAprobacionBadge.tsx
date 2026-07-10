import type { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";
import { cn } from "@/shared/lib/utils";
import {
  ESTADO_APROBACION_BADGE,
  ESTADO_APROBACION_LABEL,
} from "./estados";

type Props = {
  estado: EstadoAprobacionRecurso;
  className?: string;
};

export function EstadoAprobacionBadge({ estado, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        ESTADO_APROBACION_BADGE[estado],
        className,
      )}
    >
      {ESTADO_APROBACION_LABEL[estado]}
    </span>
  );
}
