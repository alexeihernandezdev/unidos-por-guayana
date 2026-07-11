import type { Actividad } from "@/modules/actividades/domain/Actividad";
import type { FiltroActividades } from "@/modules/actividades/domain/ActividadRepository";
import type { ActividadDeps } from "./deps";

/**
 * Lista los envíos, opcionalmente filtrados por estado. Sin filtro devuelve todos
 * (para el listado de gestión del `ADMIN`).
 */
export async function listarActividades(
  { actividades }: Pick<ActividadDeps, "actividades">,
  filtro?: FiltroActividades,
): Promise<Actividad[]> {
  return actividades.listar(filtro);
}
