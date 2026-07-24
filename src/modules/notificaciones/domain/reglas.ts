import type { EventoNotificacion } from "./NotificadorPort";
import type { Notificacion } from "./Notificacion";
import { TipoNotificacion } from "./TipoNotificacion";

// Reglas puras de notificaciones (feature 012). Sin framework, sin Prisma.
// Prohibido em-dash / en-dash en los textos visibles (constitution/tech-stack.md).

/** Texto in-app del aviso según el `tipo` y los datos del evento. */
export function componerMensaje(evento: EventoNotificacion): string {
  switch (evento.tipo) {
    case TipoNotificacion.NUEVA_ACTIVIDAD:
      return `Nueva actividad en ${evento.sectorDestino} necesita recursos.`;
    case TipoNotificacion.META_CUMPLIDA:
      return `Meta de ${evento.recursoNombre} cumplida en la actividad de ${evento.sectorDestino}.`;
  }
}

/**
 * Variables posicionales que rellenan la plantilla de WhatsApp del `tipo`. El
 * orden debe coincidir con los `{{1}}`, `{{2}}`... de la plantilla aprobada en
 * Meta (ver DOC/features/012-notificaciones.md).
 */
export function variablesPlantilla(evento: EventoNotificacion): string[] {
  switch (evento.tipo) {
    case TipoNotificacion.NUEVA_ACTIVIDAD:
      return [evento.sectorDestino];
    case TipoNotificacion.META_CUMPLIDA:
      return [evento.recursoNombre, evento.sectorDestino];
  }
}

/**
 * Clave de deduplicación estable de un evento (feature 012). Junto al
 * `@@unique([usuarioId, claveDedupe])` garantiza un solo aviso por hecho y
 * destinatario, aunque el disparador se reintente. `META_CUMPLIDA` incluye el
 * `recursoId` para permitir un aviso por meta (recurso) de la actividad.
 */
export function claveDedupe(evento: EventoNotificacion): string {
  switch (evento.tipo) {
    case TipoNotificacion.NUEVA_ACTIVIDAD:
      return `${TipoNotificacion.NUEVA_ACTIVIDAD}:ACTIVIDAD:${evento.actividadId}`;
    case TipoNotificacion.META_CUMPLIDA:
      return `${TipoNotificacion.META_CUMPLIDA}:ACTIVIDAD:${evento.actividadId}:${evento.recursoId}`;
  }
}

/** Cuenta las notificaciones no leídas de una lista (helper puro para la UI). */
export function contarNoLeidas(notificaciones: readonly Notificacion[]): number {
  return notificaciones.filter((n) => !n.leida).length;
}
