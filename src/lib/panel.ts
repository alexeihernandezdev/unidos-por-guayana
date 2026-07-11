import { PrismaAporteRepository } from "@/modules/aportes/infrastructure/PrismaAporteRepository";
import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { obtenerResumenPanel } from "@/modules/panel/application/obtenerResumenPanel";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";
import { PrismaSolicitudRepository } from "@/modules/solicitudes/infrastructure/PrismaSolicitudRepository";

const actividades = new PrismaActividadRepository();
const recursos = new PrismaRecursoRepository();
const aportes = new PrismaAporteRepository();
const solicitudes = new PrismaSolicitudRepository();
const deps = { actividades, recursos, aportes, solicitudes };

export function obtenerResumenPanelServicio(adminId: string) {
  return obtenerResumenPanel(deps, adminId);
}
