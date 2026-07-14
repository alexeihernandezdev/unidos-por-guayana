import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";

// Colores de las series de gráficos. No se inventan hex: se referencian las CSS vars
// de los tokens de marca/semánticos (ver tech-stack.md), así respetan tema claro y
// oscuro y quedan alineados con el resto del panel. El tipo de actividad es una
// categoría (no un estado), por eso usa tres hues distinguibles del set permitido
// (teal de marca, ámbar, verde), no la escala de progreso.
export const COLOR_TIPO: Record<TipoActividad, string> = {
  ENVIO: "var(--primary)",
  JORNADA: "var(--warning)",
  EVENTO_SOCIAL: "var(--success)",
};

// Orden canónico de las series en donut y barras apiladas (coincide con el orden del
// enum y con la leyenda).
export const ORDEN_TIPOS: TipoActividad[] = ["ENVIO", "JORNADA", "EVENTO_SOCIAL"];
