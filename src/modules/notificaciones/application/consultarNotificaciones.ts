import type { Notificacion } from "@/modules/notificaciones/domain/Notificacion";
import type { FiltroNotificaciones } from "@/modules/notificaciones/domain/NotificacionRepository";
import type { ConsultarDeps } from "./deps";
import { NoAutorizadoError } from "./errors";

/** Lista los avisos de un usuario, del más reciente al más antiguo. */
export function listarNotificaciones(
  { notificaciones }: ConsultarDeps,
  usuarioId: string,
  filtro?: FiltroNotificaciones,
): Promise<Notificacion[]> {
  return notificaciones.listarPorUsuario(usuarioId, filtro);
}

/** Número de avisos no leídos (contador de la campana). */
export function contarNoLeidas(
  { notificaciones }: ConsultarDeps,
  usuarioId: string,
): Promise<number> {
  return notificaciones.contarNoLeidas(usuarioId);
}

/**
 * Marca un aviso como leído. Solo el dueño puede: si el `updateMany` no afecta a
 * ninguna fila (no existe o es de otro usuario), se lanza `NoAutorizadoError`.
 */
export async function marcarLeida(
  { notificaciones }: ConsultarDeps,
  id: string,
  usuarioId: string,
): Promise<void> {
  const actualizada = await notificaciones.marcarLeida(id, usuarioId);
  if (!actualizada) {
    throw new NoAutorizadoError();
  }
}

/** Marca como leídos todos los avisos del usuario. */
export function marcarTodasLeidas(
  { notificaciones }: ConsultarDeps,
  usuarioId: string,
): Promise<void> {
  return notificaciones.marcarTodasLeidas(usuarioId);
}
