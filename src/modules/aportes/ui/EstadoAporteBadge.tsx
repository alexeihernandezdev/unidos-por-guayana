import type { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { cn } from "@/shared/lib/utils";
import { ESTADO_APORTE_BADGE, ESTADO_APORTE_LABEL } from "./estados";

type Props = {
  estado: EstadoAporte;
  className?: string;
};

export function EstadoAporteBadge({ estado, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        ESTADO_APORTE_BADGE[estado],
        className,
      )}
    >
      {ESTADO_APORTE_LABEL[estado]}
    </span>
  );
}
