import type { UbicacionSeleccion } from "@/modules/ubicacion/domain/Ubicacion";
import { validarUbicacionIds } from "@/modules/ubicacion/domain/Ubicacion";
import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";

export class UbicacionInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UbicacionInvalidaError";
  }
}

export type ValidarUbicacionCatalogoDeps = {
  ubicacion: UbicacionRepository;
};

/**
 * Valida IDs no vacíos y que el municipio pertenezca al estado indicado.
 */
export async function validarUbicacionCatalogo(
  { ubicacion }: ValidarUbicacionCatalogoDeps,
  entrada: UbicacionSeleccion,
): Promise<UbicacionSeleccion> {
  const basica = validarUbicacionIds(entrada);
  if (!basica.ok) {
    throw new UbicacionInvalidaError(basica.error);
  }

  const municipio = await ubicacion.buscarMunicipioPorId(basica.valor.municipioId);
  if (!municipio) {
    throw new UbicacionInvalidaError("El municipio seleccionado no es válido.");
  }
  if (municipio.estadoId !== basica.valor.estadoId) {
    throw new UbicacionInvalidaError(
      "El municipio no pertenece al estado seleccionado.",
    );
  }

  return basica.valor;
}
