import { DateTime } from "luxon";

export function formatearFechaCreacion(fecha: Date): string {
  return DateTime.fromJSDate(fecha).setLocale("es").toFormat("d 'de' LLLL 'de' yyyy");
}
