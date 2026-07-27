import type {
  CanalExterno,
  PreferenciaNotificacionRepository,
  PreferenciaVista,
} from "@/modules/notificaciones/domain";
import {
  preferenciasParaRol,
  tipoAplicaAlRol,
} from "@/modules/notificaciones/domain";
import type { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import type { Rol } from "@/modules/usuarios/domain/Rol";

type Deps = {
  preferencias: PreferenciaNotificacionRepository;
};

export async function consultarPreferencias(
  { preferencias }: Deps,
  usuarioId: string,
  rol: Rol,
): Promise<PreferenciaVista[]> {
  const guardadas = await preferencias.listarPorUsuario(usuarioId);
  return preferenciasParaRol(rol, guardadas);
}

export async function actualizarPreferencia(
  { preferencias }: Deps,
  usuarioId: string,
  rol: Rol,
  tipo: TipoNotificacion,
  canal: CanalExterno,
  activo: boolean,
): Promise<void> {
  if (!tipoAplicaAlRol(tipo, rol)) {
    throw new Error("Este aviso no está disponible para tu rol.");
  }
  await preferencias.guardar(usuarioId, tipo, canal, activo);
}
