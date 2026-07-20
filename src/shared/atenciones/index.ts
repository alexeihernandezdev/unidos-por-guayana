// Fachada de atenciones para la presentación (feature 030). La app importa desde aquí
// en vez de `@/lib/atenciones`, respetando el límite de capas (ui/app no importan `lib`
// directamente; ESLint lo hace cumplir).
export {
  listarNecesidadesPendientesServicio,
  vincularNecesidadServicio,
  vincularNecesidadesServicio,
  desvincularNecesidadServicio,
} from "@/lib/atenciones";

export type { NecesidadPendiente } from "@/modules/atenciones/domain/Atencion";
