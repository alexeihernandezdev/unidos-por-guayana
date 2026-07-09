import type { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { cn } from "@/shared/lib/utils";
import { ESTADO_BADGE, ESTADO_LABEL } from "./estados";

type Props = {
  estado: EstadoSolicitud;
  className?: string;
};

export function EstadoSolicitudBadge({ estado, className }: Props) {
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
