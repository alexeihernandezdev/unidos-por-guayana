import { TipoActividad } from "@/modules/actividades/domain/TipoActividad";

// Presentación por tipo de actividad (feature 018). Único punto de verdad para
// los copys visibles: `singular` (nombre del tipo en minúscula) y `etiqueta`
// visible en badges/columnas del listado y del detalle. La acción de crear usa
// un copy genérico ("Crear actividad"). Sin em-dash / en-dash
// (ver constitution/tech-stack.md).

export type PresentacionTipo = {
  singular: string;
  etiqueta: string;
};

export const TIPO_PRESENTACION: Record<TipoActividad, PresentacionTipo> = {
  [TipoActividad.ENVIO]: { singular: "envío", etiqueta: "Envío" },
  [TipoActividad.JORNADA]: { singular: "jornada", etiqueta: "Jornada" },
  [TipoActividad.EVENTO_SOCIAL]: {
    singular: "evento social",
    etiqueta: "Evento social",
  },
};

export function nombreSingular(tipo: TipoActividad): string {
  return TIPO_PRESENTACION[tipo].singular;
}

export function etiquetaTipo(tipo: TipoActividad): string {
  return TIPO_PRESENTACION[tipo].etiqueta;
}

// Clases del badge por tipo. Se apoyan en tokens de marca; sin colores inventados.
export const TIPO_BADGE: Record<TipoActividad, string> = {
  [TipoActividad.ENVIO]: "border-primary/40 bg-primary/10 text-primary-ink",
  [TipoActividad.JORNADA]: "border-accent/40 bg-accent/10 text-accent",
  [TipoActividad.EVENTO_SOCIAL]:
    "border-foreground/25 bg-foreground/5 text-foreground",
};
