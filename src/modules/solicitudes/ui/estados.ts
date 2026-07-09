import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";

export const ESTADO_LABEL: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.ABIERTA]: "Abierta",
  [EstadoSolicitud.ATENDIDA]: "Atendida",
  [EstadoSolicitud.CERRADA]: "Cerrada",
};

export const ESTADO_BADGE: Record<EstadoSolicitud, string> = {
  [EstadoSolicitud.ABIERTA]: "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoSolicitud.ATENDIDA]: "border-accent/40 bg-accent/10 text-accent",
  [EstadoSolicitud.CERRADA]: "border-foreground/25 bg-foreground/5 text-foreground",
};
