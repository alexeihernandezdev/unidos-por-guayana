import {
  contarNoLeidas,
  crearNotificador,
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from "@/modules/notificaciones/application";
import type { Notificacion } from "@/modules/notificaciones/domain/Notificacion";
import type { NotificadorPort } from "@/modules/notificaciones/domain/NotificadorPort";
import type { FiltroNotificaciones } from "@/modules/notificaciones/domain/NotificacionRepository";
import {
  PrismaLectorContacto,
  PrismaNotificacionRepository,
  WhatsAppCloudAdapter,
} from "@/modules/notificaciones/infrastructure";

// ── Composition root de notificaciones (feature 012) ─────────────────────────
// Cablea el repositorio Prisma, el lector de contacto y el adaptador de WhatsApp
// (plug-n-play, no-op sin credenciales) en un `NotificadorPort` compuesto. El
// puerto lo consumen los composition roots de actividades (024) y aportes (006)
// para disparar los avisos; la presentación consume las lecturas por la fachada
// `@/shared/notificaciones`.
const notificaciones = new PrismaNotificacionRepository();
const contactos = new PrismaLectorContacto();
const canalWhatsApp = new WhatsAppCloudAdapter();

/** Puerto de emisión (in-app + WhatsApp). Se inyecta en 024 y 006. */
export const notificador: NotificadorPort = crearNotificador({
  notificaciones,
  contactos,
  canalWhatsApp,
});

const consultarDeps = { notificaciones };

export function listarNotificacionesServicio(
  usuarioId: string,
  filtro?: FiltroNotificaciones,
): Promise<Notificacion[]> {
  return listarNotificaciones(consultarDeps, usuarioId, filtro);
}

export function contarNoLeidasServicio(usuarioId: string): Promise<number> {
  return contarNoLeidas(consultarDeps, usuarioId);
}

export function marcarLeidaServicio(
  id: string,
  usuarioId: string,
): Promise<void> {
  return marcarLeida(consultarDeps, id, usuarioId);
}

export function marcarTodasLeidasServicio(usuarioId: string): Promise<void> {
  return marcarTodasLeidas(consultarDeps, usuarioId);
}
