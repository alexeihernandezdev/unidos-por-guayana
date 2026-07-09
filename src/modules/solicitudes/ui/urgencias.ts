import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";

export const URGENCIA_LABEL: Record<UrgenciaSolicitud, string> = {
  [UrgenciaSolicitud.BAJA]: "Baja",
  [UrgenciaSolicitud.MEDIA]: "Media",
  [UrgenciaSolicitud.ALTA]: "Alta",
};

export const URGENCIA_BADGE: Record<UrgenciaSolicitud, string> = {
  [UrgenciaSolicitud.BAJA]: "border-border bg-muted text-foreground/80",
  [UrgenciaSolicitud.MEDIA]: "border-primary/40 bg-primary/10 text-primary-ink",
  [UrgenciaSolicitud.ALTA]: "border-destructive/40 bg-destructive/10 text-destructive",
};
