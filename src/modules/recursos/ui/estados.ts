import { EstadoAprobacionRecurso } from "@/modules/recursos/domain/EstadoAprobacionRecurso";

// Etiquetas y badge por estado de aprobación (feature 019). Sin em-dash /
// en-dash en los copys visibles (constitution/tech-stack.md).
export const ESTADO_APROBACION_LABEL: Record<EstadoAprobacionRecurso, string> =
  {
    [EstadoAprobacionRecurso.APROBADO]: "Aprobado",
    [EstadoAprobacionRecurso.PROPUESTO]: "Propuesto",
    [EstadoAprobacionRecurso.RECHAZADO]: "Rechazado",
  };

// Paleta semántica de `tech-stack.md § Estilo visual` (feature 028): ámbar =
// requiere atención (propuesto, pendiente de revisión), teal = disponible.
export const ESTADO_APROBACION_BADGE: Record<
  EstadoAprobacionRecurso,
  string
> = {
  [EstadoAprobacionRecurso.APROBADO]:
    "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoAprobacionRecurso.PROPUESTO]:
    "border-warning/40 bg-warning/15 text-warning-ink",
  [EstadoAprobacionRecurso.RECHAZADO]:
    "border-destructive/40 bg-destructive/10 text-destructive",
};
