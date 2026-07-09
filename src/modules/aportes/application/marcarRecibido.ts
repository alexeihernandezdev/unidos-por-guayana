import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { puedeMarcarRecibido } from "@/modules/aportes/domain/maquinaEstados";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Actor, AporteDeps } from "./deps";
import {
  AporteNoEncontradoError,
  NoAutorizadoError,
  TransicionInvalidaError,
} from "./errors";

/**
 * Marca un aporte como `RECIBIDO` (solo ADMIN). La transición se aplica de forma
 * idempotente en el repositorio (`updateMany` filtrando por estado previo) para
 * proteger de race conditions cuando dos administradores marcan a la vez.
 */
export async function marcarRecibido(
  { aportes }: Pick<AporteDeps, "aportes">,
  id: string,
  actor: Actor,
): Promise<Aporte> {
  if (actor.rol !== Rol.ADMIN) {
    throw new NoAutorizadoError("Solo un ADMIN puede marcar aportes como recibidos.");
  }

  const actual = await aportes.buscarPorId(id);
  if (!actual) throw new AporteNoEncontradoError(id);

  if (!puedeMarcarRecibido(actual.estado)) {
    throw new TransicionInvalidaError(
      `El aporte está en ${actual.estado}; solo se marca RECIBIDO desde COMPROMETIDO.`,
    );
  }

  const actualizado = await aportes.cambiarEstado(
    id,
    EstadoAporte.COMPROMETIDO,
    EstadoAporte.RECIBIDO,
  );
  if (!actualizado) {
    // Otro proceso cambió el estado entre el read y el write.
    throw new TransicionInvalidaError(
      "El aporte cambió de estado antes de poder marcarlo como RECIBIDO.",
    );
  }
  return actualizado;
}
