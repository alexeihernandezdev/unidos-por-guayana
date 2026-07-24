import type { Notificacion, NuevaNotificacion } from "./Notificacion";

export type FiltroNotificaciones = {
  soloNoLeidas?: boolean;
  // Máximo de filas a devolver (bandeja / popover de la campana).
  limite?: number;
};

// Contrato de persistencia de notificaciones. La implementación concreta (Prisma)
// vive en infraestructura; el dominio solo define la interfaz.
export interface NotificacionRepository {
  /**
   * Inserta varias notificaciones ignorando duplicados por
   * `@@unique([usuarioId, claveDedupe])` (idempotencia ante reintentos).
   */
  crearMuchas(nuevas: readonly NuevaNotificacion[]): Promise<void>;
  /** Ids de usuarios que ya tienen una notificación con esa `claveDedupe`. */
  usuariosConClave(claveDedupe: string): Promise<string[]>;
  listarPorUsuario(
    usuarioId: string,
    filtro?: FiltroNotificaciones,
  ): Promise<Notificacion[]>;
  contarNoLeidas(usuarioId: string): Promise<number>;
  /** Marca una como leída solo si es del usuario. `true` si actualizó alguna. */
  marcarLeida(id: string, usuarioId: string): Promise<boolean>;
  marcarTodasLeidas(usuarioId: string): Promise<void>;
}
