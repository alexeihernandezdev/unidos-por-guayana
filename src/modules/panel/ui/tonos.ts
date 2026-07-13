// Paleta semántica del panel (decisión de equipo · ver tech-stack.md →
// "Paleta semántica de estado"). Cada tono está anclado a un significado
// operativo, no a decoración:
//
//   warning (ámbar) → en preparación / requiere atención pronto
//   teal    (primary) → listo, disponible para el siguiente paso
//   accent  (teal profundo) → en marcha / en tránsito
//   success (verde) → completado, meta lograda
//   danger  (rojo) → urgente
//   neutral → sin carga de estado
//
// Las clases se apoyan solo en tokens ya expuestos vía @theme inline; no se
// inventan hex sueltos. Las variantes de texto usan los `-ink` (contraste AA).
export type Tono =
  | "warning"
  | "teal"
  | "accent"
  | "success"
  | "danger"
  | "neutral";

type ClasesTono = {
  /** Superficie de la tarjeta: borde + wash muy tenue del tono. */
  card: string;
  /** Contenedor cuadrado del ícono. */
  chip: string;
  /** Color del número/valor destacado. */
  valor: string;
  /** Color del enlace/afordancia "ver". */
  enlace: string;
  /** Relleno de barras de progreso. */
  barra: string;
};

export const TONO: Record<Tono, ClasesTono> = {
  warning: {
    card: "border-warning/30 bg-warning/[0.07] hover:bg-warning/[0.12]",
    chip: "bg-warning/20 text-warning-ink",
    valor: "text-warning-ink",
    enlace: "text-warning-ink",
    barra: "bg-warning",
  },
  teal: {
    card: "border-primary/25 bg-primary/[0.05] hover:bg-primary/[0.09]",
    chip: "bg-primary/15 text-primary-ink",
    valor: "text-primary-ink",
    enlace: "text-primary-ink",
    barra: "bg-primary",
  },
  accent: {
    card: "border-accent/25 bg-accent/[0.05] hover:bg-accent/[0.09]",
    chip: "bg-accent/15 text-accent",
    valor: "text-accent",
    enlace: "text-accent",
    barra: "bg-accent",
  },
  success: {
    card: "border-success/30 bg-success/[0.06] hover:bg-success/[0.11]",
    chip: "bg-success/18 text-success-ink",
    valor: "text-success-ink",
    enlace: "text-success-ink",
    barra: "bg-success",
  },
  danger: {
    card: "border-destructive/25 bg-destructive/[0.05] hover:bg-destructive/[0.09]",
    chip: "bg-destructive/15 text-destructive",
    valor: "text-destructive",
    enlace: "text-destructive",
    barra: "bg-destructive",
  },
  neutral: {
    card: "border-border bg-card hover:bg-muted/50",
    chip: "bg-muted text-foreground/70",
    valor: "text-foreground",
    enlace: "text-accent",
    barra: "bg-muted-foreground/60",
  },
};

// Tono de una barra de progreso según cuánto se ha completado: lo que recién
// arranca pide atención (ámbar), lo que avanza va en teal, y lo logrado en verde.
export function tonoPorProgreso(porcentaje: number): Tono {
  if (porcentaje >= 100) return "success";
  if (porcentaje >= 50) return "teal";
  return "warning";
}
