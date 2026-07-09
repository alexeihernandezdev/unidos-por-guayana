import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";

export const ESTADO_APORTE_LABEL: Record<EstadoAporte, string> = {
  [EstadoAporte.COMPROMETIDO]: "Comprometido",
  [EstadoAporte.RECIBIDO]: "Recibido",
};

// Clases del badge por estado. Ocre = comprometido (intención, marca);
// teal = recibido (confirmado por el ADMIN). No inventamos colores.
export const ESTADO_APORTE_BADGE: Record<EstadoAporte, string> = {
  [EstadoAporte.COMPROMETIDO]:
    "border-primary/40 bg-primary/10 text-primary-ink",
  [EstadoAporte.RECIBIDO]: "border-accent/40 bg-accent/10 text-accent",
};
