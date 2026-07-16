import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import {
  esCantidadAporteValida,
  normalizarNota,
} from "@/modules/aportes/domain/reglas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import type { Actor, AporteDeps } from "./deps";
import {
  ActividadNoAceptaAportesError,
  DatosAporteInvalidosError,
  NoAutorizadoError,
  RecursoFueraDeMetasError,
} from "./errors";

export type RegistrarAporteDirectoInput = {
  actividadId: string;
  recursoId: string;
  cantidad: number;
  nota?: string | null;
};

/**
 * Registra una donación directa que el ADMIN dueño recibió por fuera para su
 * actividad (feature 029). A diferencia de `crearAporte` (colaborador) y de
 * `registrarAporteExterno` (014, solo dinero), esta cubre CUALQUIER recurso de las
 * metas y la ejecuta el ADMIN dueño.
 *
 * Reglas:
 * 1. Solo un `ADMIN` puede imputar una donación directa.
 * 2. La actividad existe y es del propio ADMIN (aislamiento por dueño, feature 022).
 * 3. La actividad sigue en `RECOLECTANDO` (tras `LISTO` no se aceptan aportes).
 * 4. El recurso está entre las metas de la actividad, existe y está activo.
 * 5. `cantidad > 0`.
 *
 * El aporte nace directamente en `RECIBIDO` (la donación ya está en mano) como
 * `esAnonimo` y sin `colaboradorId`; `registradoPorId` deja al ADMIN para auditoría.
 * Así suma al progreso sin atribuirse al administrador en los reportes.
 */
export async function registrarAporteDirecto(
  { aportes, actividades, recursos }: AporteDeps,
  input: RegistrarAporteDirectoInput,
  actor: Actor,
): Promise<Aporte> {
  if (actor.rol !== Rol.ADMIN) {
    throw new NoAutorizadoError(
      "Solo un ADMIN puede registrar una donación directa.",
    );
  }

  if (!esCantidadAporteValida(input.cantidad)) {
    throw new DatosAporteInvalidosError("La cantidad debe ser mayor que cero.");
  }

  const actividad = await actividades.buscarPorId(input.actividadId);
  if (!actividad) throw new ActividadNoEncontradaError(input.actividadId);

  if (actividad.adminId !== actor.id) {
    throw new NoAutorizadoError(
      "Solo el administrador dueño puede registrar donaciones en esta actividad.",
    );
  }

  if (actividad.estado !== EstadoActividad.RECOLECTANDO) {
    throw new ActividadNoAceptaAportesError(
      `La actividad ya está en ${actividad.estado}; solo se aceptan aportes mientras esté RECOLECTANDO.`,
    );
  }

  const enMetas = actividad.metas.some((m) => m.recursoId === input.recursoId);
  if (!enMetas) {
    throw new RecursoFueraDeMetasError(
      "El recurso indicado no forma parte de las metas de esta actividad.",
    );
  }

  const recurso = await recursos.buscarPorId(input.recursoId);
  if (!recurso) {
    throw new RecursoFueraDeMetasError("El recurso indicado no existe.");
  }
  if (!recurso.activo) {
    throw new RecursoFueraDeMetasError(
      `El recurso "${recurso.nombre}" está archivado y no puede recibir aportes.`,
    );
  }

  return aportes.crear({
    actividadId: input.actividadId,
    recursoId: input.recursoId,
    colaboradorId: null,
    cantidad: input.cantidad,
    nota: normalizarNota(input.nota),
    esAnonimo: true,
    estado: EstadoAporte.RECIBIDO,
    registradoPorId: actor.id,
  });
}
