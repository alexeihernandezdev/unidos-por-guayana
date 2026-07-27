import type { TipoNotificacion } from "./TipoNotificacion";

// Evento de notificación (feature 012). Es una unión por `tipo`. El **emisor**
// (casos de uso de 024 y 006) resuelve los `destinatarioIds` y los datos del
// mensaje con los repositorios que ya tiene, y llama al puerto; así el módulo de
// notificaciones no depende de afiliaciones ni de aportes.

export type NuevaActividadEvento = {
  tipo: typeof TipoNotificacion.NUEVA_ACTIVIDAD;
  actividadId: string;
  sectorDestino: string;
  // Red apta del admin dueño (feature 025), ya resuelta por el emisor.
  destinatarioIds: readonly string[];
};

export type MetaCumplidaEvento = {
  tipo: typeof TipoNotificacion.META_CUMPLIDA;
  actividadId: string;
  sectorDestino: string;
  recursoId: string;
  recursoNombre: string;
  // ADMIN dueño + colaboradores que aportaron a la meta, ya resueltos por el emisor.
  destinatarioIds: readonly string[];
};

// Formato extensible para eventos cuyos destinatarios y texto ya fueron resueltos
// por el caso de uso que conoce la entidad de origen (feature 036).
export type EventoNotificacionDirecto = {
  directo: true;
  tipo: TipoNotificacion;
  destinatarioIds: readonly string[];
  mensaje: string;
  asunto: string;
  referenciaTipo: string;
  referenciaId: string;
  claveDedupe: string;
  variablesWhatsApp?: readonly string[];
};

export type EventoNotificacion =
  | NuevaActividadEvento
  | MetaCumplidaEvento
  | EventoNotificacionDirecto;

/**
 * Puerto de emisión de avisos (feature 012). Lo definen las notificaciones y lo
 * importan como **contrato** las features de origen (024, 006), que lo reciben por
 * inyección. La implementación concreta (persistir in-app + enviar WhatsApp) vive
 * en la capa de aplicación/infraestructura de este módulo. La emisión es
 * best-effort: nunca debe hacer fallar la operación de negocio que la disparó.
 */
export interface NotificadorPort {
  emitir(evento: EventoNotificacion): Promise<void>;
}
