import {
  contarNoLeidas,
  crearNotificador,
  consultarPreferencias,
  actualizarPreferencia,
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  probarCanalEmail,
} from "@/modules/notificaciones/application";
import type { Notificacion } from "@/modules/notificaciones/domain/Notificacion";
import type { NotificadorPort } from "@/modules/notificaciones/domain/NotificadorPort";
import type { FiltroNotificaciones } from "@/modules/notificaciones/domain/NotificacionRepository";
import type {
  CanalExterno,
  PreferenciaVista,
} from "@/modules/notificaciones/domain";
import type { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import type { Rol } from "@/modules/usuarios/domain/Rol";
import {
  PrismaLectorContacto,
  PrismaNotificacionRepository,
  PrismaPreferenciaNotificacionRepository,
  SmtpEmailAdapter,
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
const preferencias = new PrismaPreferenciaNotificacionRepository();
const canalWhatsApp = new WhatsAppCloudAdapter();
const canalEmail = new SmtpEmailAdapter();

/** Puerto de emisión (in-app + WhatsApp). Se inyecta en 024 y 006. */
export const notificador: NotificadorPort = crearNotificador({
  notificaciones,
  contactos,
  canalWhatsApp,
  canalEmail,
  preferencias,
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

export function consultarPreferenciasServicio(
  usuarioId: string,
  rol: Rol,
): Promise<PreferenciaVista[]> {
  return consultarPreferencias({ preferencias }, usuarioId, rol);
}

export function actualizarPreferenciaServicio(
  usuarioId: string,
  rol: Rol,
  tipo: TipoNotificacion,
  canal: CanalExterno,
  activo: boolean,
): Promise<void> {
  return actualizarPreferencia(
    { preferencias },
    usuarioId,
    rol,
    tipo,
    canal,
    activo,
  );
}

export function smtpDisponibleServicio(): boolean {
  return canalEmail.disponible();
}

export function enviarCorreoPruebaServicio(usuarioId: string): Promise<void> {
  return probarCanalEmail({ contactos, canalEmail }, usuarioId);
}

export async function consultarCanalesUsuarioServicio(usuarioId: string): Promise<{
  email: string;
  whatsappDisponible: boolean;
}> {
  const [contacto] = await contactos.contactoDe([usuarioId]);
  return {
    email: contacto?.email ?? "",
    whatsappDisponible: Boolean(
      contacto?.telefonoEsWhatsApp && contacto.telefono,
    ),
  };
}
