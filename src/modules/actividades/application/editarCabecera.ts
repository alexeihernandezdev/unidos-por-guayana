import type { Actividad, CambiosActividad } from "@/modules/actividades/domain/Actividad";
import { esEditable } from "@/modules/actividades/domain/maquinaEstados";
import {
  esSectorValido,
  esTituloValido,
  normalizarDescripcion,
  normalizarTexto,
} from "@/modules/actividades/domain/reglas";
import {
  type ActividadDeps,
  assertEsDueño,
  validarPuntoAcopio,
} from "./deps";
import { ActividadNoEditableError, ActividadNoEncontradaError } from "./errors";
import { DatosActividadInvalidosError } from "./errors";

export type EditarCabeceraInput = {
  titulo?: string;
  sectorDestino?: string;
  fecha?: Date;
  horaFin?: Date | null;
  descripcion?: string | null;
  puntoAcopioId?: string | null;
};

/**
 * Edita la cabecera (título, sector, fecha, hora de fin, descripción, punto de
 * acopio) de una Actividad, solo si sigue en `RECOLECTANDO` y pertenece al `adminId`
 * solicitante. Valida los campos que vengan y persiste únicamente esos. El dueño no
 * se transfiere.
 */
export async function editarCabecera(
  { actividades, puntos }: Pick<ActividadDeps, "actividades" | "puntos">,
  id: string,
  adminId: string,
  input: EditarCabeceraInput,
): Promise<Actividad> {
  const actual = await actividades.buscarPorId(id);
  if (!actual) {
    throw new ActividadNoEncontradaError(id);
  }
  assertEsDueño(actual, adminId);
  if (!esEditable(actual.estado)) {
    throw new ActividadNoEditableError(
      "Solo se puede editar una actividad mientras está en RECOLECTANDO.",
    );
  }

  const cambios: CambiosActividad = {};

  if (input.titulo !== undefined) {
    const titulo = normalizarTexto(input.titulo);
    if (!esTituloValido(titulo)) {
      throw new DatosActividadInvalidosError("El título no puede estar vacío.");
    }
    cambios.titulo = titulo;
  }

  if (input.sectorDestino !== undefined) {
    const sectorDestino = normalizarTexto(input.sectorDestino);
    if (!esSectorValido(sectorDestino)) {
      throw new DatosActividadInvalidosError(
        "El sector de destino no puede estar vacío.",
      );
    }
    cambios.sectorDestino = sectorDestino;
  }

  if (input.fecha !== undefined) {
    cambios.fecha = input.fecha;
  }

  if (input.horaFin !== undefined) {
    cambios.horaFin = input.horaFin;
  }

  if (input.descripcion !== undefined) {
    cambios.descripcion = normalizarDescripcion(input.descripcion);
  }

  if (input.puntoAcopioId !== undefined) {
    if (input.puntoAcopioId) {
      await validarPuntoAcopio(puntos, input.puntoAcopioId, adminId);
    }
    cambios.puntoAcopioId = input.puntoAcopioId;
  }

  return actividades.actualizarCabecera(id, cambios);
}
