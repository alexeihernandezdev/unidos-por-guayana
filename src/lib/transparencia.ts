import { PrismaAporteRepository } from "@/modules/aportes/infrastructure/PrismaAporteRepository";
import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { obtenerDetallePublico } from "@/modules/transparencia/application/obtener-detalle-publico";
import type { DetallePublico } from "@/modules/transparencia/application/obtener-detalle-publico";
import { obtenerResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import type { ResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";

const actividades = new PrismaActividadRepository();
const recursos = new PrismaRecursoRepository();
const aportes = new PrismaAporteRepository();
const deps = { actividades, recursos, aportes };

export function obtenerResumenPublicoServicio(): Promise<ResumenPublico> {
  return obtenerResumenPublico(deps);
}

export function obtenerDetallePublicoServicio(
  actividadId: string,
): Promise<DetallePublico | null> {
  return obtenerDetallePublico(deps, actividadId);
}
