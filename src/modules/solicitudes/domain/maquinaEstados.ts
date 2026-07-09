import { EstadoSolicitud } from "./EstadoSolicitud";

// Máquina de estados de la Solicitud: regla de dominio pura y testeable (sin base ni
// framework). El ciclo de vida avanza desde `ABIERTA` hacia `ATENDIDA` o `CERRADA`;
// ambos son terminales y no se reabren.

/** Solo desde `ABIERTA` el ADMIN puede marcar la solicitud como atendida. */
export function puedeMarcarAtendida(estado: EstadoSolicitud): boolean {
  return estado === EstadoSolicitud.ABIERTA;
}

/** Solo desde `ABIERTA` se puede cerrar (por ADMIN o cancelar por solicitante). */
export function puedeCerrar(estado: EstadoSolicitud): boolean {
  return estado === EstadoSolicitud.ABIERTA;
}

/** Solo en `ABIERTA` se pueden editar cabecera y recursos. */
export function esEditable(estado: EstadoSolicitud): boolean {
  return estado === EstadoSolicitud.ABIERTA;
}
