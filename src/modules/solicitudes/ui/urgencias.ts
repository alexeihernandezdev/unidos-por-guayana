import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";

export const URGENCIA_LABEL: Record<UrgenciaSolicitud, string> = {
  [UrgenciaSolicitud.BAJA]: "Baja",
  [UrgenciaSolicitud.MEDIA]: "Media",
  [UrgenciaSolicitud.ALTA]: "Alta",
};

// Paleta semántica de `tech-stack.md § Estilo visual` (feature 028): urgencia
// media = ámbar (requiere atención pronto), alta = rojo (urgente). El color
// acompaña a la etiqueta, nunca la sustituye.
export const URGENCIA_BADGE: Record<UrgenciaSolicitud, string> = {
  [UrgenciaSolicitud.BAJA]: "border-border bg-muted text-foreground/80",
  [UrgenciaSolicitud.MEDIA]: "border-warning/40 bg-warning/15 text-warning-ink",
  [UrgenciaSolicitud.ALTA]: "border-destructive/40 bg-destructive/10 text-destructive",
};

// Rail de acento vertical para listas/grids: rojo urgente, ámbar media, teal calmo.
// Lectura de un vistazo; acompaña al badge, no lo sustituye.
export const URGENCIA_RAIL: Record<UrgenciaSolicitud, string> = {
  [UrgenciaSolicitud.BAJA]: "bg-primary/45",
  [UrgenciaSolicitud.MEDIA]: "bg-warning",
  [UrgenciaSolicitud.ALTA]: "bg-destructive",
};
