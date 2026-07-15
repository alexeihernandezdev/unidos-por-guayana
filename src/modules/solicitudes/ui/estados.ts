import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";

export const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.ABIERTA]: "Abierta",
  [EstadoSolicitud.ATENDIDA]: "Atendida",
  [EstadoSolicitud.CERRADA]: "Cerrada",
};

// Paleta semántica de `tech-stack.md § Estilo visual` (feature 028): teal =
// disponible para el siguiente paso (abierta), verde = completado (atendida).
export const ESTADO_BADGE: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.ABIERTA]: "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoSolicitud.ATENDIDA]: "border-success/40 bg-success/15 text-success-ink",
  [EstadoSolicitud.CERRADA]: "border-foreground/25 bg-foreground/5 text-foreground",
};
