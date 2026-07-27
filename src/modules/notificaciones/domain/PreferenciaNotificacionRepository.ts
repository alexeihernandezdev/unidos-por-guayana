import type {
  CanalExterno,
  PreferenciaNotificacion,
} from "./PreferenciaNotificacion";
import type { TipoNotificacion } from "./TipoNotificacion";

export interface PreferenciaNotificacionRepository {
  listarPorUsuario(usuarioId: string): Promise<PreferenciaNotificacion[]>;
  listarPorUsuarios(usuarioIds: readonly string[]): Promise<PreferenciaNotificacion[]>;
  guardar(
    usuarioId: string,
    tipo: TipoNotificacion,
    canal: CanalExterno,
    activo: boolean,
  ): Promise<void>;
}
