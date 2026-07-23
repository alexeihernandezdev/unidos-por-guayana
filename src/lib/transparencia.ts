import { PrismaAporteRepository } from "@/modules/aportes/infrastructure/PrismaAporteRepository";
import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { obtenerDetallePublico } from "@/modules/transparencia/application/obtener-detalle-publico";
import type { DetallePublico } from "@/modules/transparencia/application/obtener-detalle-publico";
import { obtenerResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import type { ResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";
import { SupabaseStorageAdapter } from "@/modules/archivos/infrastructure/SupabaseStorageAdapter";

const actividades = new PrismaActividadRepository();
const recursos = new PrismaRecursoRepository();
const aportes = new PrismaAporteRepository();
// Bucket público de las imágenes de actividad (feature 033), para resolver portadas y
// adjuntos en las superficies públicas.
const storage = new SupabaseStorageAdapter("SUPABASE_STORAGE_BUCKET_PUBLICO");
const deps = { actividades, recursos, aportes, storage };

export function obtenerResumenPublicoServicio(): Promise<ResumenPublico> {
  return obtenerResumenPublico(deps);
}

export function obtenerDetallePublicoServicio(
  actividadId: string,
): Promise<DetallePublico | null> {
  return obtenerDetallePublico(deps, actividadId);
}
