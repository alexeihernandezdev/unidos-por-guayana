import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { puedeRevertir } from "@/modules/aportes/domain/maquinaEstados";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Actor, AporteDeps } from "./deps";
import {
  AporteNoEncontradoError,
  NoAutorizadoError,
  TransicionInvalidaError,
} from "./errors";

/**
 * Revierte un aporte de `RECIBIDO` a `COMPROMETIDO` (corrección del ADMIN).
 * El histórico completo con nota y autor de la reversión vive en la feature 010;
 * aquí solo queda el rastro básico en `updatedAt`.
 */
export async function revertirRecibido(
  { aportes }: Pick<AporteDeps, "aportes">,
  id: string,
  actor: Actor,
): Promise<Aporte> {
  if (actor.rol !== Rol.ADMIN) {
    throw new NoAutorizadoError("Solo un ADMIN puede revertir aportes recibidos.");
  }

  const actual = await aportes.buscarPorId(id);
  if (!actual) throw new AporteNoEncontradoError(id);

  if (!puedeRevertir(actual.estado)) {
    throw new TransicionInvalidaError(
      `El aporte está en ${actual.estado}; solo se revierte desde RECIBIDO.`,
    );
  }

  const actualizado = await aportes.cambiarEstado(
    id,
    EstadoAporte.RECIBIDO,
    EstadoAporte.COMPROMETIDO,
  );
  if (!actualizado) {
    throw new TransicionInvalidaError(
      "El aporte cambió de estado antes de poder revertirlo.",
    );
  }
  return actualizado;
}
