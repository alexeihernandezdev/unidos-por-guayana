import { DateTime } from "luxon";
import type { Notificacion } from "@/modules/notificaciones/domain/Notificacion";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { hrefDeReferencia } from "@/modules/notificaciones/domain/reglas";

// Helpers de presentación de notificaciones (feature 012). Puros de formato.

/** Fecha en `DD/MM/AAAA` con locale es-VE (constitution/tech-stack.md). */
export function formatearFecha(fecha: Date): string {
  return DateTime.fromJSDate(fecha, { zone: "utc" })
    .setLocale("es-VE")
    .toFormat("dd/MM/yyyy");
}

/**
 * Enlace a la entidad referenciada. Hoy la referencia siempre es una Actividad; el
 * ADMIN dueño la gestiona en `/panel/actividades/[id]`, el resto la ve en
 * `/actividades/[id]`.
 */
export function hrefDeNotificacion(rol: Rol, notificacion: Notificacion): string {
  return hrefDeReferencia(
    rol,
    notificacion.referenciaTipo,
    notificacion.referenciaId,
  );
}
