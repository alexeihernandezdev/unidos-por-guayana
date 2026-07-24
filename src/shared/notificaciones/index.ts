// Fachada de notificaciones para la presentación (feature 012). La app (páginas y
// server actions) importa desde aquí en vez de `@/lib/notificaciones`, respetando
// el límite de capas (ui/app no importan `lib` directamente; ESLint lo hace cumplir).
export {
  listarNotificacionesServicio,
  contarNoLeidasServicio,
  marcarLeidaServicio,
  marcarTodasLeidasServicio,
} from "@/lib/notificaciones";
export type { Notificacion } from "@/modules/notificaciones/domain/Notificacion";
export { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
export { NoAutorizadoError } from "@/modules/notificaciones/application/errors";
