import { contarAportesPendientes } from "@/modules/aportes/application/contarAportesPendientes";
import { progresoDeAyuda } from "@/modules/aportes/application/progresoDeAyuda";
import {
  contarAyudasPorEstado,
  contarEnviosActivos,
} from "@/modules/ayudas/application/contarAyudasPorEstado";
import { listarPrioridadRecolectando } from "@/modules/ayudas/application/listarPrioridadRecolectando";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { contarSolicitudesAbiertasPorSector } from "@/modules/solicitudes/application/contarSolicitudesAbiertasPorSector";
import { contarSolicitudesPorUrgencia } from "@/modules/solicitudes/application/contarSolicitudesPorUrgencia";
import { sectoresTop } from "@/modules/solicitudes/application/sectoresTop";
import type { ConteosPorEstadoAyuda } from "@/modules/ayudas/application/contarAyudasPorEstado";
import type { ConteosPorUrgencia } from "@/modules/solicitudes/application/contarSolicitudesPorUrgencia";
import type { SectorTop } from "@/modules/solicitudes/application/sectoresTop";
import type { PanelDeps } from "./deps";

export type ProgresoAgregadoRecolectando = {
  metasAlCien: number;
  metasBajo: number;
  porcentajePromedio: number;
};

export type EnvioPrioridadPanel = {
  ayudaId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  porcentaje: number;
  solicitudesAfinesConteo: number;
};

export type ResumenPanel = {
  enviosPorEstado: Pick<
    ConteosPorEstadoAyuda,
    "RECOLECTANDO" | "LISTO" | "EN_TRANSITO"
  >;
  progresoAgregadoRecolectando: ProgresoAgregadoRecolectando;
  solicitudesAbiertasPorUrgencia: ConteosPorUrgencia;
  aportesPendientesConteo: number;
  sectoresTop: SectorTop[];
  enviosPrioridad: EnvioPrioridadPanel[];
};

async function calcularProgresoAgregadoRecolectando(
  deps: PanelDeps,
): Promise<ProgresoAgregadoRecolectando> {
  const recolectando = await deps.ayudas.listar({
    estado: EstadoAyuda.RECOLECTANDO,
  });
  if (recolectando.length === 0) {
    return { metasAlCien: 0, metasBajo: 0, porcentajePromedio: 0 };
  }

  let metasAlCien = 0;
  let metasBajo = 0;
  let sumaPorcentajesAyuda = 0;

  for (const ayuda of recolectando) {
    const progreso = await progresoDeAyuda(deps, ayuda.id);
    for (const meta of progreso) {
      if (meta.porcentaje >= 100) metasAlCien++;
      else metasBajo++;
    }
    const promedioAyuda =
      progreso.length === 0
        ? 0
        : progreso.reduce((acc, p) => acc + Math.min(100, p.porcentaje), 0) /
          progreso.length;
    sumaPorcentajesAyuda += promedioAyuda;
  }

  return {
    metasAlCien,
    metasBajo,
    porcentajePromedio: sumaPorcentajesAyuda / recolectando.length,
  };
}

/** Vista consolidada read-only del panel del ADMIN. */
export async function obtenerResumenPanel(
  deps: PanelDeps,
): Promise<ResumenPanel> {
  const [
    conteosTotales,
    prioridad,
    solicitudesAbiertasPorUrgencia,
    aportesPendientesConteo,
    sectores,
    progresoAgregadoRecolectando,
  ] = await Promise.all([
    contarAyudasPorEstado(deps),
    listarPrioridadRecolectando(deps),
    contarSolicitudesPorUrgencia(deps),
    contarAportesPendientes(deps),
    sectoresTop(deps),
    calcularProgresoAgregadoRecolectando(deps),
  ]);

  const enviosPrioridad = await Promise.all(
    prioridad.map(async ({ ayuda, porcentaje }) => ({
      ayudaId: ayuda.id,
      titulo: ayuda.titulo,
      sectorDestino: ayuda.sectorDestino,
      fecha: ayuda.fecha,
      porcentaje,
      solicitudesAfinesConteo: await contarSolicitudesAbiertasPorSector(
        deps,
        ayuda.sectorDestino,
      ),
    })),
  );

  return {
    enviosPorEstado: contarEnviosActivos(conteosTotales),
    progresoAgregadoRecolectando,
    solicitudesAbiertasPorUrgencia,
    aportesPendientesConteo,
    sectoresTop: sectores,
    enviosPrioridad,
  };
}
