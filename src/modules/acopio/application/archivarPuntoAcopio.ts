import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import type { PuntoAcopioRepository } from "@/modules/acopio/domain/PuntoAcopioRepository";
import { perteneceA } from "@/modules/acopio/domain/reglas";
import {
  PuntoAcopioAjenoError,
  PuntoAcopioNoEncontradoError,
} from "./errors";

export type CambiarActivoDeps = {
  puntos: PuntoAcopioRepository;
};

async function cambiar(
  { puntos }: CambiarActivoDeps,
  adminId: string,
  id: string,
  activo: boolean,
): Promise<PuntoAcopio> {
  const actual = await puntos.buscarPorId(id);
  if (!actual) throw new PuntoAcopioNoEncontradoError(id);
  if (!perteneceA(actual, adminId)) throw new PuntoAcopioAjenoError();
  if (actual.activo === activo) return actual;
  return puntos.cambiarActivo(id, activo);
}

/** Archiva (soft) el punto: `activo = false`. Comprueba propiedad. */
export function archivarPuntoAcopio(
  deps: CambiarActivoDeps,
  adminId: string,
  id: string,
): Promise<PuntoAcopio> {
  return cambiar(deps, adminId, id, false);
}

/** Reactiva el punto: `activo = true`. Comprueba propiedad. */
export function activarPuntoAcopio(
  deps: CambiarActivoDeps,
  adminId: string,
  id: string,
): Promise<PuntoAcopio> {
  return cambiar(deps, adminId, id, true);
}
