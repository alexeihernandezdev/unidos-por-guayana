import { EstadoSolicitud as Estados } from "@/modules/solicitudes/domain/EstadoSolicitud";
import type { FiltroSolicitudes } from "@/modules/solicitudes/domain/SolicitudRepository";
import type { SolicitudDeps } from "./deps";

export type SectorTop = {
  sector: string;
  conteo: number;
};

function normalizarSector(sector: string): string {
  return sector.trim().toLowerCase();
}

/**
 * Top-N sectores con más solicitudes abiertas. Agrupa por sector normalizado
 * (trim + lowercase) pero devuelve la etiqueta del primer caso visto.
 */
export async function sectoresTop(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  filtro: Omit<FiltroSolicitudes, "sector"> = { estado: Estados.ABIERTA },
  limite = 5,
): Promise<SectorTop[]> {
  const lista = await solicitudes.listar(filtro);
  const porClave = new Map<string, { sector: string; conteo: number }>();

  for (const s of lista) {
    const clave = normalizarSector(s.sector);
    if (!clave) continue;
    const actual = porClave.get(clave);
    if (actual) {
      actual.conteo++;
    } else {
      porClave.set(clave, { sector: s.sector.trim(), conteo: 1 });
    }
  }

  return [...porClave.values()]
    .toSorted((a, b) => b.conteo - a.conteo)
    .slice(0, Math.max(0, limite));
}

export { normalizarSector };
