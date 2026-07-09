import { EstadoAporte } from "./EstadoAporte";

// Máquina de estados del Aporte: regla de dominio pura. Un aporte nace
// `COMPROMETIDO` y solo el ADMIN lo marca `RECIBIDO`; el ADMIN puede también
// revertir un `RECIBIDO` para corregir un marcado erróneo. La cancelación
// (eliminación) solo aplica mientras siga `COMPROMETIDO`.

/** ¿Se puede transicionar `COMPROMETIDO → RECIBIDO`? */
export function puedeMarcarRecibido(estado: EstadoAporte): boolean {
  return estado === EstadoAporte.COMPROMETIDO;
}

/** ¿Se puede cancelar (borrar) el aporte? Solo si sigue `COMPROMETIDO`. */
export function puedeCancelar(estado: EstadoAporte): boolean {
  return estado === EstadoAporte.COMPROMETIDO;
}

/** ¿Se puede revertir `RECIBIDO → COMPROMETIDO`? (corrección del ADMIN) */
export function puedeRevertir(estado: EstadoAporte): boolean {
  return estado === EstadoAporte.RECIBIDO;
}
