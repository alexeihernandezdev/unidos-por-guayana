import { DateTime } from "luxon";

// Formateo de fechas de la Ayuda con Luxon. La `fecha` de salida se guarda a nivel
// de día en UTC; se interpreta en UTC para mostrar el mismo día que se eligió, sin
// desplazamientos por zona horaria.

/** Fecha de salida legible, p. ej. "1 de agosto de 2026". */
export function formatearFecha(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" })
    .setLocale("es")
    .toFormat("d 'de' LLLL 'de' yyyy");
}

/** Fecha en formato `yyyy-mm-dd` para inputs `type="date"`. */
export function fechaParaInput(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" }).toFormat("yyyy-MM-dd");
}
