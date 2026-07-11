import { PrismaAporteRepository } from "@/modules/aportes/infrastructure/PrismaAporteRepository";
import { PrismaAyudaRepository } from "@/modules/ayudas/infrastructure/PrismaAyudaRepository";
import { obtenerResumenPanel } from "@/modules/panel/application/obtenerResumenPanel";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";
import { PrismaSolicitudRepository } from "@/modules/solicitudes/infrastructure/PrismaSolicitudRepository";

const ayudas = new PrismaAyudaRepository();
const recursos = new PrismaRecursoRepository();
const aportes = new PrismaAporteRepository();
const solicitudes = new PrismaSolicitudRepository();
const deps = { ayudas, recursos, aportes, solicitudes };

export function obtenerResumenPanelServicio(adminId: string) {
  return obtenerResumenPanel(deps, adminId);
}
