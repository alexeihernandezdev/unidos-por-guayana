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

// Clases del badge por estado. Se apoyan en los tokens de marca (ocre = primary,
// teal = accent) y en neutrales; sin inventar colores nuevos (ver tech-stack.md).
// Los estados equivalentes por posición comparten estilo (preparación, listo, en
// marcha, terminado).
export const ESTADO_BADGE: Record<EstadoActividad, string> = {
  [EstadoActividad.RECOLECTANDO]: "border-border bg-muted text-foreground/80",
  [EstadoActividad.LISTO]: "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoActividad.EN_TRANSITO]: "border-accent/40 bg-accent/10 text-accent",
  [EstadoActividad.ENTREGADO]: "border-foreground/25 bg-foreground/5 text-foreground",
  [EstadoActividad.LISTA]: "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoActividad.EN_CURSO]: "border-accent/40 bg-accent/10 text-accent",
  [EstadoActividad.REALIZADA]: "border-foreground/25 bg-foreground/5 text-foreground",
};
