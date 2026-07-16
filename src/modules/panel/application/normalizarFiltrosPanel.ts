import { DateTime } from "luxon";
import type { FiltroPanel } from "./obtenerResumenPanel";

export type QueryFiltrosPanel = {
  centro?: string | string[];
  desde?: string | string[];
  hasta?: string | string[];
};

export type FiltrosPanelNormalizados = {
  filtro: FiltroPanel;
  centro?: string;
  desde?: string;
  hasta?: string;
};

function escalar(valor: string | string[] | undefined): string | undefined {
  return typeof valor === "string" ? valor : undefined;
}

function fechaISOValida(valor: string | undefined): valor is string {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = DateTime.fromISO(valor, { zone: "utc" });
  return fecha.isValid && fecha.toISODate() === valor;
}

export function normalizarFiltrosPanel(
  query: QueryFiltrosPanel,
  centrosPropiosIds: readonly string[],
): FiltrosPanelNormalizados {
  const centroQuery = escalar(query.centro);
  const centro =
    centrosPropiosIds.length > 1 &&
    centroQuery !== "todos" &&
    centroQuery !== undefined &&
    centrosPropiosIds.includes(centroQuery)
      ? centroQuery
      : undefined;

  const desdeQuery = escalar(query.desde);
  const hastaQuery = escalar(query.hasta);
  const rangoValido =
    fechaISOValida(desdeQuery) &&
    fechaISOValida(hastaQuery) &&
    desdeQuery <= hastaQuery;

  const desde = rangoValido ? desdeQuery : undefined;
  const hasta = rangoValido ? hastaQuery : undefined;

  return {
    filtro: {
      ...(centro ? { puntoAcopioId: centro } : {}),
      ...(desde ? { fechaDesde: new Date(desde + "T00:00:00.000Z") } : {}),
      ...(hasta ? { fechaHasta: new Date(hasta + "T00:00:00.000Z") } : {}),
    },
    centro,
    desde,
    hasta,
  };
}
