import { EstadoTestimonio } from "./EstadoTestimonio";
import type { Testimonio } from "./Testimonio";

export const LIMITES_TESTIMONIO = {
  TITULO_MIN: 5,
  TITULO_MAX: 80,
  CONTENIDO_MIN: 40,
  CONTENIDO_MAX: 1000,
  MOTIVO_MIN: 10,
  MOTIVO_MAX: 300,
  DESTACADOS_MAX: 6,
} as const;

export function validarContenido(titulo: string, contenido: string): void {
  const t = titulo.trim();
  const c = contenido.trim();
  if (t.length < LIMITES_TESTIMONIO.TITULO_MIN || t.length > LIMITES_TESTIMONIO.TITULO_MAX) {
    throw new Error("El título debe tener entre 5 y 80 caracteres.");
  }
  if (c.length < LIMITES_TESTIMONIO.CONTENIDO_MIN || c.length > LIMITES_TESTIMONIO.CONTENIDO_MAX) {
    throw new Error("El testimonio debe tener entre 40 y 1.000 caracteres.");
  }
}

export function puedeEditar(testimonio: Testimonio): boolean {
  return (
    testimonio.estado === EstadoTestimonio.PENDIENTE ||
    testimonio.estado === EstadoTestimonio.RECHAZADO
  );
}
