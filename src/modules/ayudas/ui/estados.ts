import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";

// Etiquetas de presentación para cada estado (el dominio guarda el valor en
// mayúsculas con guion bajo; aquí se traduce a un texto legible en español).
export const ESTADO_LABEL: Record<EstadoAyuda, string> = {
  [EstadoAyuda.RECOLECTANDO]: "Recolectando",
  [EstadoAyuda.LISTO]: "Listo",
  [EstadoAyuda.EN_TRANSITO]: "En tránsito",
  [EstadoAyuda.ENTREGADO]: "Entregado",
};

// Clases del badge por estado. Se apoyan en los tokens de marca (ocre = primary,
// teal = accent) y en neutrales; sin inventar colores nuevos (ver tech-stack.md).
export const ESTADO_BADGE: Record<EstadoAyuda, string> = {
  [EstadoAyuda.RECOLECTANDO]: "border-border bg-muted text-foreground/80",
  [EstadoAyuda.LISTO]: "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoAyuda.EN_TRANSITO]: "border-accent/40 bg-accent/10 text-accent",
  [EstadoAyuda.ENTREGADO]: "border-foreground/25 bg-foreground/5 text-foreground",
};
