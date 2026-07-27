import type { EventoNotificacion } from "./NotificadorPort";
import type { Notificacion } from "./Notificacion";
import { TipoNotificacion } from "./TipoNotificacion";
import { Rol } from "@/modules/usuarios/domain/Rol";

// Reglas puras de notificaciones (feature 012). Sin framework, sin Prisma.
// Prohibido em-dash / en-dash en los textos visibles (constitution/tech-stack.md).

/** Texto in-app del aviso según el `tipo` y los datos del evento. */
export function componerMensaje(evento: EventoNotificacion): string {
  if ("directo" in evento) return evento.mensaje;
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
  if ("directo" in evento) {
    return [...(evento.variablesWhatsApp ?? [evento.mensaje])];
  }
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
  if ("directo" in evento) return evento.claveDedupe;
  switch (evento.tipo) {
    case TipoNotificacion.NUEVA_ACTIVIDAD:
      return `${TipoNotificacion.NUEVA_ACTIVIDAD}:ACTIVIDAD:${evento.actividadId}`;
    case TipoNotificacion.META_CUMPLIDA:
      return `${TipoNotificacion.META_CUMPLIDA}:ACTIVIDAD:${evento.actividadId}:${evento.recursoId}`;
  }
}

export function referenciaDeEvento(evento: EventoNotificacion): {
  tipo: string;
  id: string;
} {
  if ("directo" in evento) {
    return { tipo: evento.referenciaTipo, id: evento.referenciaId };
  }
  return { tipo: "ACTIVIDAD", id: evento.actividadId };
}

export function asuntoDeEvento(evento: EventoNotificacion): string {
  if ("directo" in evento) return evento.asunto;
  switch (evento.tipo) {
    case TipoNotificacion.NUEVA_ACTIVIDAD:
      return "Nueva actividad compatible con tus aportes";
    case TipoNotificacion.META_CUMPLIDA:
      return `Meta de ${evento.recursoNombre} cumplida`;
  }
}

export function hrefDeReferencia(
  rol: Rol,
  referenciaTipo: string,
  referenciaId: string,
): string {
  switch (referenciaTipo) {
    case "ACTIVIDAD":
      return rol === Rol.ADMIN
        ? `/panel/actividades/${referenciaId}`
        : `/actividades/${referenciaId}`;
    case "SOLICITUD":
      if (rol === Rol.ADMIN) return `/panel/solicitudes/${referenciaId}`;
      if (rol === Rol.AUDITOR) return `/auditoria/solicitudes/${referenciaId}`;
      return `/solicitudes/${referenciaId}`;
    case "RECURSO":
      return rol === Rol.ADMIN
        ? "/panel/recursos/propuestas"
        : "/solicitudes/proponer-recurso";
    case "TESTIMONIO":
      return "/mis-testimonios";
    case "AFILIACION":
      return rol === Rol.ADMIN ? "/panel/red" : "/mi-perfil";
    case "ADMIN":
      return rol === Rol.SUPERADMIN ? "/superadmin/admins" : "/inicio";
    default:
      return "/notificaciones";
  }
}

/** Cuenta las notificaciones no leídas de una lista (helper puro para la UI). */
export function contarNoLeidas(notificaciones: readonly Notificacion[]): number {
  return notificaciones.filter((n) => !n.leida).length;
}
