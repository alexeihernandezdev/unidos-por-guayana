import type { Ayuda, CambiosAyuda } from "@/modules/ayudas/domain/Ayuda";
import { esEditable } from "@/modules/ayudas/domain/maquinaEstados";
import {
  esSectorValido,
  esTituloValido,
  normalizarDescripcion,
  normalizarTexto,
} from "@/modules/ayudas/domain/reglas";
import { type AyudaDeps, assertEsDueño } from "./deps";
import { AyudaNoEditableError, AyudaNoEncontradaError } from "./errors";
import { DatosAyudaInvalidosError } from "./errors";

export type EditarCabeceraInput = {
  titulo?: string;
  sectorDestino?: string;
  fecha?: Date;
  descripcion?: string | null;
};

/**
 * Edita la cabecera (título, sector, fecha, descripción) de una Ayuda, solo si
 * sigue en `RECOLECTANDO` y pertenece al `adminId` solicitante. Valida los
 * campos que vengan y persiste únicamente esos. El dueño no se transfiere.
 */
export async function editarCabecera(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  id: string,
  adminId: string,
  input: EditarCabeceraInput,
): Promise<Ayuda> {
  const actual = await ayudas.buscarPorId(id);
  if (!actual) {
    throw new AyudaNoEncontradaError(id);
  }
  assertEsDueño(actual, adminId);
  if (!esEditable(actual.estado)) {
    throw new AyudaNoEditableError(
      "Solo se puede editar una ayuda mientras está en RECOLECTANDO.",
    );
  }

  const cambios: CambiosAyuda = {};

  if (input.titulo !== undefined) {
    const titulo = normalizarTexto(input.titulo);
    if (!esTituloValido(titulo)) {
      throw new DatosAyudaInvalidosError("El título no puede estar vacío.");
    }
    cambios.titulo = titulo;
  }

  if (input.sectorDestino !== undefined) {
    const sectorDestino = normalizarTexto(input.sectorDestino);
    if (!esSectorValido(sectorDestino)) {
      throw new DatosAyudaInvalidosError(
        "El sector de destino no puede estar vacío.",
      );
    }
    cambios.sectorDestino = sectorDestino;
  }

  if (input.fecha !== undefined) {
    cambios.fecha = input.fecha;
  }

  if (input.descripcion !== undefined) {
    cambios.descripcion = normalizarDescripcion(input.descripcion);
  }

  return ayudas.actualizarCabecera(id, cambios);
}
