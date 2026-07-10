import { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";

// Etiquetas y badge por estado de aprobación (feature 019). Sin em-dash /
// en-dash en los copys visibles (constitution/tech-stack.md).
export const ESTADO_APROBACION_LABEL: Record<EstadoAprobacionRecurso, string> =
  {
    [EstadoAprobacionRecurso.APROBADO]: "Aprobado",
    [EstadoAprobacionRecurso.PROPUESTO]: "Propuesto",
    [EstadoAprobacionRecurso.RECHAZADO]: "Rechazado",
  };

export const ESTADO_APROBACION_BADGE: Record<
  EstadoAprobacionRecurso,
  string
> = {
  [EstadoAprobacionRecurso.APROBADO]:
    "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoAprobacionRecurso.PROPUESTO]:
    "border-accent/40 bg-accent/10 text-accent",
  [EstadoAprobacionRecurso.RECHAZADO]:
    "border-destructive/40 bg-destructive/10 text-destructive",
};
