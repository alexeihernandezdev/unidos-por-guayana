import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { progresoDeActividad } from "@/modules/aportes/application/progresoDeActividad";
import {
  contarActividadesPorEstado,
  contarEnviosActivos,
} from "@/modules/actividades/application/contarActividadesPorEstado";
import { listarPrioridadRecolectando } from "@/modules/actividades/application/listarPrioridadRecolectando";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { contarSolicitudesAbiertasPorSector } from "@/modules/solicitudes/application/contarSolicitudesAbiertasPorSector";
import { contarSolicitudesPorUrgencia } from "@/modules/solicitudes/application/contarSolicitudesPorUrgencia";
import { sectoresTop } from "@/modules/solicitudes/application/sectoresTop";
import type { ConteosPorEstadoActividad } from "@/modules/actividades/application/contarActividadesPorEstado";
import type { ConteosPorUrgencia } from "@/modules/solicitudes/application/contarSolicitudesPorUrgencia";
import type { SectorTop } from "@/modules/solicitudes/application/sectoresTop";
import { calcularEstadisticasActividades } from "./estadisticasActividades";
import type { EstadisticasActividades } from "./estadisticasActividades";
import type { PanelDeps } from "./deps";

export type ProgresoAgregadoRecolectando = {
  metasAlCien: number;
  metasBajo: number;
  porcentajePromedio: number;
};

export type EnvioPrioridadPanel = {
  actividadId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  porcentaje: number;
  solicitudesAfinesConteo: number;
};

export type ResumenPanel = {
  enviosPorEstado: Pick<
    ConteosPorEstadoActividad,
    "RECOLECTANDO" | "LISTO" | "EN_TRANSITO"
  >;
  /** Actividades activas de cualquier tipo (todas menos ENTREGADO/REALIZADA). */
  actividadesActivas: number;
  progresoAgregadoRecolectando: ProgresoAgregadoRecolectando;
  solicitudesAbiertasPorUrgencia: ConteosPorUrgencia;
  aportesPendientesConteo: number;
  sectoresTop: SectorTop[];
  enviosPrioridad: EnvioPrioridadPanel[];
  /** Métricas de los tres tipos de actividad (donut, tendencia, feed). */
  estadisticas: EstadisticasActividades;
};

// Estados terminales: la actividad ya cumplió su ciclo y no necesita atención.
const ESTADOS_TERMINALES: EstadoActividad[] = [
  EstadoActividad.ENTREGADO,
  EstadoActividad.REALIZADA,
];

function contarActivas(conteos: ConteosPorEstadoActividad): number {
  return (Object.keys(conteos) as EstadoActividad[])
    .filter((estado) => !ESTADOS_TERMINALES.includes(estado))
    .reduce((acc, estado) => acc + conteos[estado], 0);
}

async function calcularProgresoAgregadoRecolectando(
  deps: PanelDeps,
  adminId: string,
): Promise<ProgresoAgregadoRecolectando> {
  const recolectando = await deps.actividades.listar({
    estado: EstadoActividad.RECOLECTANDO,
    adminId,
  });
  if (recolectando.length === 0) {
    return { metasAlCien: 0, metasBajo: 0, porcentajePromedio: 0 };
  }

  let metasAlCien = 0;
  let metasBajo = 0;
  let sumaPorcentajesActividad = 0;

  for (const ayuda of recolectando) {
    const progreso = await progresoDeActividad(deps, ayuda.id);
    for (const meta of progreso) {
      if (meta.porcentaje >= 100) metasAlCien++;
      else metasBajo++;
    }
    const promedioActividad =
      progreso.length === 0
        ? 0
        : progreso.reduce((acc, p) => acc + Math.min(100, p.porcentaje), 0) /
          progreso.length;
    sumaPorcentajesActividad += promedioActividad;
  }

  return {
    metasAlCien,
    metasBajo,
    porcentajePromedio: sumaPorcentajesActividad / recolectando.length,
  };
}

/** Aportes COMPROMETIDO solo de las actividades del ADMIN dueño (feature 022). */
async function contarAportesPendientesDelAdmin(
  deps: PanelDeps,
  adminId: string,
): Promise<number> {
  const actividades = await deps.actividades.listar({ adminId });
  const conteos = await Promise.all(
    actividades.map((ayuda) =>
      deps.aportes.contar({
        estado: EstadoAporte.COMPROMETIDO,
        actividadId: ayuda.id,
      }),
    ),
  );
  return conteos.reduce((acc, n) => acc + n, 0);
}

/**
 * Vista consolidada read-only del panel del ADMIN. Las métricas de actividades
 * (envíos, prioridad, progreso, aportes pendientes sobre esas actividades) se
 * acotan al `adminId` de sesión (feature 022). Solicitudes/sectores siguen
 * globales (no se aíslan en esta feature).
 */
export async function obtenerResumenPanel(
  deps: PanelDeps,
  adminId: string,
  ahora: Date = new Date(),
): Promise<ResumenPanel> {
  const [
    actividadesDelAdmin,
    conteosTotales,
    prioridad,
    solicitudesAbiertasPorUrgencia,
    aportesPendientesConteo,
    sectores,
    progresoAgregadoRecolectando,
  ] = await Promise.all([
    deps.actividades.listar({ adminId }),
    contarActividadesPorEstado(deps, { adminId }),
    listarPrioridadRecolectando(deps, adminId),
    contarSolicitudesPorUrgencia(deps),
    contarAportesPendientesDelAdmin(deps, adminId),
    sectoresTop(deps),
    calcularProgresoAgregadoRecolectando(deps, adminId),
  ]);

  const estadisticas = calcularEstadisticasActividades(
    actividadesDelAdmin,
    ahora,
  );

  const enviosPrioridad = await Promise.all(
    prioridad.map(async ({ ayuda, porcentaje }) => ({
      actividadId: ayuda.id,
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
    actividadesActivas: contarActivas(conteosTotales),
    progresoAgregadoRecolectando,
    solicitudesAbiertasPorUrgencia,
    aportesPendientesConteo,
    sectoresTop: sectores,
    enviosPrioridad,
    estadisticas,
  };
}
