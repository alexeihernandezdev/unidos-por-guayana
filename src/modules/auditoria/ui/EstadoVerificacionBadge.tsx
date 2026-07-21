import {
  CircleCheck,
  CircleHelp,
  CircleX,
  Clock3,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import {
  EstadoVerificacionSolicitud,
  type EstadoVerificacionSolicitud as Estado,
} from "@/modules/auditoria/domain";
import { cn } from "@/shared/lib/utils";

export const ESTADO_VERIFICACION_LABEL: Record<Estado, string> = {
  [EstadoVerificacionSolicitud.PENDIENTE]: "Pendiente",
  [EstadoVerificacionSolicitud.EN_REVISION]: "En revisión",
  [EstadoVerificacionSolicitud.REQUIERE_INFORMACION]: "Requiere información",
  [EstadoVerificacionSolicitud.VERIFICADA]: "Verificada",
  [EstadoVerificacionSolicitud.NO_VERIFICADA]: "No verificada",
};

const ICONO: Record<Estado, LucideIcon> = {
  [EstadoVerificacionSolicitud.PENDIENTE]: Clock3,
  [EstadoVerificacionSolicitud.EN_REVISION]: ScanSearch,
  [EstadoVerificacionSolicitud.REQUIERE_INFORMACION]: CircleHelp,
  [EstadoVerificacionSolicitud.VERIFICADA]: CircleCheck,
  [EstadoVerificacionSolicitud.NO_VERIFICADA]: CircleX,
};

const TONO: Record<Estado, string> = {
  [EstadoVerificacionSolicitud.PENDIENTE]: "bg-muted text-foreground/75",
  [EstadoVerificacionSolicitud.EN_REVISION]: "bg-primary/10 text-primary-ink",
  [EstadoVerificacionSolicitud.REQUIERE_INFORMACION]:
    "bg-warning/15 text-warning-ink",
  [EstadoVerificacionSolicitud.VERIFICADA]: "bg-success/15 text-success-ink",
  [EstadoVerificacionSolicitud.NO_VERIFICADA]:
    "bg-destructive/10 text-destructive",
};

export function EstadoVerificacionBadge({
  estado,
  className,
}: {
  estado: Estado;
  className?: string;
}) {
  const Icon = ICONO[estado];
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONO[estado],
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
      {ESTADO_VERIFICACION_LABEL[estado]}
    </span>
  );
}
