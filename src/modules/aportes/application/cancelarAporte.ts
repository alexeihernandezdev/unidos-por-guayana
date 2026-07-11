import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { puedeCancelar } from "@/modules/aportes/domain/maquinaEstados";
import { Rol } from "@/modules/usuarios/domain/Rol";
import type { Actor, AporteDeps } from "./deps";
import {
  AporteNoEncontradoError,
  ActividadNoAceptaAportesError,
  NoAutorizadoError,
  TransicionInvalidaError,
} from "./errors";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";

/**
 * Cancela (elimina) un aporte. Reglas:
 * - Solo el dueño del aporte o un `ADMIN` pueden cancelarlo.
 * - Solo si el aporte sigue `COMPROMETIDO` (una vez `RECIBIDO` se revierte, no
 *   se cancela: es corrección del ADMIN).
 * - Solo si la Actividad sigue en `RECOLECTANDO` (tras `LISTO` los aportes quedan
 *   fijos, aunque estén COMPROMETIDOS: se consideran "no cumplidos" y no bloquean).
 */
export async function cancelarAporte(
  { aportes, actividades }: Pick<AporteDeps, "aportes" | "actividades">,
  id: string,
  actor: Actor,
): Promise<void> {
  const aporte = await aportes.buscarPorId(id);
  if (!aporte) throw new AporteNoEncontradoError(id);

  const esDueno = aporte.colaboradorId === actor.id;
  const esAdmin = actor.rol === Rol.ADMIN;
  if (!esDueno && !esAdmin) {
    throw new NoAutorizadoError("No puedes cancelar aportes de otro usuario.");
  }

  if (!puedeCancelar(aporte.estado)) {
    throw new TransicionInvalidaError(
      `El aporte ya está en ${aporte.estado}; solo se cancela mientras esté COMPROMETIDO.`,
    );
  }

  if (!aporte.actividadId) {
    throw new TransicionInvalidaError(
      "Un aporte general no se cancela por este flujo.",
    );
  }
  const ayuda = await actividades.buscarPorId(aporte.actividadId);
  if (!ayuda) throw new ActividadNoEncontradaError(aporte.actividadId);
  if (ayuda.estado !== EstadoActividad.RECOLECTANDO) {
    throw new ActividadNoAceptaAportesError(
      `La ayuda ya está en ${ayuda.estado}; los aportes quedan fijos.`,
    );
  }

  await aportes.eliminar(id);
}
