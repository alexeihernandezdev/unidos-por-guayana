import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";
import type { FaseOperativa } from "@/modules/transparencia/application/derivarPanel";

// Colores de las series del "command center" de transparencia. La sección vive sobre un
// fondo teal petróleo muy oscuro (mismo que la escena "Ayuda en movimiento" de la
// landing), así que los tokens de marca en su valor claro por defecto quedarían apagados.
// En lugar de inventar hex, se aclaran los tokens vía `color-mix` hacia blanco: siguen
// anclados a la identidad (teal de marca, ámbar, verde) y respetan la disciplina de color
// de la constitución, pero con el brillo necesario para leer sobre oscuro.

// Fondo teal petróleo profundo de la sección (mismo valor que la escena oscura de la
// landing, "Ayuda en movimiento"), para dar continuidad al enlace que trae aquí.
export const PANEL_BG = "oklch(0.19 0.045 194)";

/** Teal de marca brillante, el color protagonista de la sección. */
export const TEAL_BRILLANTE = "color-mix(in oklch, var(--primary) 60%, white)";
export const TEAL_TENUE = "color-mix(in oklch, var(--primary) 32%, white)";

// El tipo de actividad es una categoría (no un estado): tres hues distinguibles del set
// permitido. Coincide en intención con `coloresGraficos.ts` del panel admin, reajustado
// para fondo oscuro.
export const COLOR_TIPO: Record<TipoActividad, string> = {
  ENVIO: TEAL_BRILLANTE,
  JORNADA: "var(--warning)",
  EVENTO_SOCIAL: "color-mix(in oklch, var(--success) 62%, white)",
};

// La fase operativa sí porta significado de progreso: recolectando pide atención (ámbar),
// preparado ya disponible (teal), en marcha en tránsito (accent aclarado) y cumplido
// logrado (verde). Mismo mapa semántico que `tonos.ts`, aclarado para oscuro.
export const COLOR_FASE: Record<FaseOperativa, string> = {
  RECOLECTANDO: "var(--warning)",
  PREPARADO: TEAL_BRILLANTE,
  EN_MARCHA: "color-mix(in oklch, var(--accent) 45%, white)",
  CUMPLIDO: "color-mix(in oklch, var(--success) 62%, white)",
};
