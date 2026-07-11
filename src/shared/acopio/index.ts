// Fachada de acopio para la presentación. La app (páginas y server actions)
// importa desde aquí en vez de `@/lib/acopio`, respetando el límite de capas
// (ui/app no importan `lib` directamente; ESLint lo hace cumplir).
export {
  crearPuntoAcopioServicio,
  listarPuntosDeAdminServicio,
  buscarPuntoAcopioServicio,
  editarPuntoAcopioServicio,
  archivarPuntoAcopioServicio,
  activarPuntoAcopioServicio,
  centroMapaPorDefectoServicio,
  listarPuntosActivosServicio,
  verPuntoAcopioActivoServicio,
} from "@/lib/acopio";
export type { CentroMapa } from "@/modules/acopio/domain/LectorCentroMapa";
export type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
