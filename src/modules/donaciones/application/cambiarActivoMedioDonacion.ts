import type { MedioDonacion } from "@/modules/donaciones/domain/MedioDonacion";
import type { MedioDonacionDeps } from "./deps";
import { MedioDonacionNoEncontradoError } from "./errors";

/**
 * Activa un medio de donación (feature 014): vuelve a mostrarlo en las superficies
 * públicas. Un medio nunca se borra; se activa/desactiva.
 */
export async function activarMedioDonacion(
  { medios }: MedioDonacionDeps,
  id: string,
): Promise<MedioDonacion> {
  const existente = await medios.buscarPorId(id);
  if (!existente) throw new MedioDonacionNoEncontradoError(id);
  return medios.cambiarActivo(id, true);
}

/**
 * Desactiva un medio de donación (feature 014): lo oculta del público conservando
 * la trazabilidad de los ingresos asociados. Es la alternativa a borrar.
 */
export async function desactivarMedioDonacion(
  { medios }: MedioDonacionDeps,
  id: string,
): Promise<MedioDonacion> {
  const existente = await medios.buscarPorId(id);
  if (!existente) throw new MedioDonacionNoEncontradoError(id);
  return medios.cambiarActivo(id, false);
}
