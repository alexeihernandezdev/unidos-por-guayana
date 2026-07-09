import type { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { cn } from "@/shared/lib/utils";
import { URGENCIA_BADGE, URGENCIA_LABEL } from "./urgencias";

type Props = {
  urgencia: UrgenciaSolicitud;
  className?: string;
};

export function UrgenciaBadge({ urgencia, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        URGENCIA_BADGE[urgencia],
        className,
      )}
    >
      {URGENCIA_LABEL[urgencia]}
    </span>
  );
}
