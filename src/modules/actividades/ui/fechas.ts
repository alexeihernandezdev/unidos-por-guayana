import { DateTime } from "luxon";

// Formateo de fechas de la Actividad con Luxon. La `fecha` de salida se guarda a nivel
// de día en UTC; se interpreta en UTC para mostrar el mismo día que se eligió, sin
// desplazamientos por zona horaria.

/** Fecha de salida en formato español día/mes/año, p. ej. "01/08/2026". */
export function formatearFecha(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("dd/MM/yyyy");
}

/**
 * Fecha en formato `yyyy-mm-dd` para el `value` de inputs `type="date"`.
 * Es el formato ISO que exige el control nativo, no texto visible al usuario.
 */
export function fechaParaInput(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" }).toFormat("yyyy-MM-dd");
}

/**
 * Hora en formato `HH:mm` (24h, UTC) para el `value` de un input `type="time"`.
 * Se usa con la `horaFin` opcional de jornadas/eventos (feature 024).
 */
export function horaParaInput(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" }).toFormat("HH:mm");
}

/** Hora de fin en formato español `HH:mm` para mostrar (p. ej. "13:00"). */
export function formatearHora(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("HH:mm");
}
