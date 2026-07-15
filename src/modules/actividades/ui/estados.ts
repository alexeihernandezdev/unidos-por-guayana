import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";

// Etiquetas de presentación para cada estado (el dominio guarda el valor en
// mayúsculas con guion bajo; aquí se traduce a un texto legible en español). Como
// cada secuencia (envío / evento) usa valores distintos a partir del segundo paso
// (LISTO vs. LISTA, etc.), el mapa por estado ya da el vocabulario correcto según el
// tipo sin necesidad de conocerlo (feature 024).
export const ESTADO_LABEL: Record<EstadoActividad, string> = {
  [EstadoActividad.RECOLECTANDO]: "Recolectando",
  [EstadoActividad.LISTO]: "Listo",
  [EstadoActividad.EN_TRANSITO]: "En tránsito",
  [EstadoActividad.ENTREGADO]: "Entregado",
  [EstadoActividad.LISTA]: "Lista",
  [EstadoActividad.EN_CURSO]: "En curso",
  [EstadoActividad.REALIZADA]: "Realizada",
};

// Clases del badge por estado (feature 028). Usan la paleta semántica de
// `tech-stack.md § Estilo visual`: ámbar = en preparación (recolectando),
// teal = listo para el siguiente paso, accent = en marcha, verde = completado.
// El color acompaña a la etiqueta, nunca es el único portador del estado.
export const ESTADO_BADGE: Record<EstadoActividad, string> = {
  [EstadoActividad.RECOLECTANDO]:
    "border-warning/40 bg-warning/15 text-warning-ink",
  [EstadoActividad.LISTO]: "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoActividad.EN_TRANSITO]: "border-accent/40 bg-accent/10 text-accent",
  [EstadoActividad.ENTREGADO]:
    "border-success/40 bg-success/15 text-success-ink",
  [EstadoActividad.LISTA]: "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoActividad.EN_CURSO]: "border-accent/40 bg-accent/10 text-accent",
  [EstadoActividad.REALIZADA]:
    "border-success/40 bg-success/15 text-success-ink",
};
