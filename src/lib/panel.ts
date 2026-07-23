import { PrismaAporteRepository } from "@/modules/aportes/infrastructure/PrismaAporteRepository";
import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { obtenerResumenPanel } from "@/modules/panel/application/obtenerResumenPanel";
import type { FiltroPanel } from "@/modules/panel/application/obtenerResumenPanel";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";
import { PrismaSolicitudRepository } from "@/modules/solicitudes/infrastructure/PrismaSolicitudRepository";
import { catalogoUbicacion } from "@/lib/ubicacion";

const actividades = new PrismaActividadRepository();
const recursos = new PrismaRecursoRepository();
const aportes = new PrismaAporteRepository();
const solicitudes = new PrismaSolicitudRepository();
// `catalogo` viene con `SolicitudDeps` (feature 035); el panel no crea solicitudes,
// pero comparte el tipo de dependencias, así que se inyecta la misma instancia.
const deps = { actividades, recursos, aportes, solicitudes, catalogo: catalogoUbicacion };

export function obtenerResumenPanelServicio(
  adminId: string,
  filtro: FiltroPanel = {},
) {
  return obtenerResumenPanel(deps, adminId, filtro.fechaHasta ?? new Date(), filtro);
}
