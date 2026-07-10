import { PrismaAporteRepository } from "@/modules/aportes/infrastructure/PrismaAporteRepository";
import { PrismaAyudaRepository } from "@/modules/ayudas/infrastructure/PrismaAyudaRepository";
import { obtenerDetallePublico } from "@/modules/transparencia/application/obtener-detalle-publico";
import type { DetallePublico } from "@/modules/transparencia/application/obtener-detalle-publico";
import { obtenerResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import type { ResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";

const ayudas = new PrismaAyudaRepository();
const recursos = new PrismaRecursoRepository();
const aportes = new PrismaAporteRepository();
const deps = { ayudas, recursos, aportes };

export function obtenerResumenPublicoServicio(): Promise<ResumenPublico> {
  return obtenerResumenPublico(deps);
}

export function obtenerDetallePublicoServicio(
  ayudaId: string,
): Promise<DetallePublico | null> {
  return obtenerDetallePublico(deps, ayudaId);
}
