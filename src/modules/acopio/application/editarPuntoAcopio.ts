import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import type { PuntoAcopioRepository } from "@/modules/acopio/domain/PuntoAcopioRepository";
import {
  esCoordenadaLatitud,
  esCoordenadaLongitud,
  esTextoNoVacio,
  normalizar,
  normalizarCoordenada,
  perteneceA,
} from "@/modules/acopio/domain/reglas";
import type { CatalogoUbicacionRepository } from "@/modules/ubicacion/domain/CatalogoUbicacionRepository";
import { validarUbicacion } from "@/modules/ubicacion/domain/validarUbicacion";
import {
  DatosPuntoAcopioInvalidosError,
  PuntoAcopioAjenoError,
  PuntoAcopioNoEncontradoError,
} from "./errors";

export type EditarPuntoAcopioDeps = {
  puntos: PuntoAcopioRepository;
  catalogoUbicacion: CatalogoUbicacionRepository;
};

// Todos los campos son opcionales: se actualiza solo lo que venga. `adminId`
// nunca cambia (inmutable). `activo` se alterna con archivar/activar, no aquí.
export type EditarPuntoAcopioInput = Partial<{
  nombre: string;
  referencia: string;
  latitud: string;
  longitud: string;
  horarios: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string | null;
  estadoId: string;
  municipioId: string;
}>;

/**
 * Edita un punto de acopio existente:
 * 1. Verifica que exista y que pertenezca al `adminId` (propiedad).
 * 2. Revalida los campos que vengan y las coordenadas.
 * 3. Si cambia `estadoId` o `municipioId`, revalida coherencia contra el
 *    catálogo con los valores efectivos (mezcla de cambios + actuales).
 */
export async function editarPuntoAcopio(
  { puntos, catalogoUbicacion }: EditarPuntoAcopioDeps,
  adminId: string,
  id: string,
  input: EditarPuntoAcopioInput,
): Promise<PuntoAcopio> {
  const actual = await puntos.buscarPorId(id);
  if (!actual) throw new PuntoAcopioNoEncontradoError(id);
  if (!perteneceA(actual, adminId)) throw new PuntoAcopioAjenoError();

  const cambios: EditarPuntoAcopioInput = {};

  if (input.nombre !== undefined) {
    const v = normalizar(input.nombre);
    if (!esTextoNoVacio(v)) {
      throw new DatosPuntoAcopioInvalidosError("Indica el nombre del punto.");
    }
    cambios.nombre = v;
  }
  if (input.referencia !== undefined) {
    const v = normalizar(input.referencia);
    if (!esTextoNoVacio(v)) {
      throw new DatosPuntoAcopioInvalidosError(
        "Indica una referencia para orientar a quien va a llegar.",
      );
    }
    cambios.referencia = v;
  }
  if (input.horarios !== undefined) {
    const v = normalizar(input.horarios);
    if (!esTextoNoVacio(v)) {
      throw new DatosPuntoAcopioInvalidosError(
        "Indica los horarios de atención.",
      );
    }
    cambios.horarios = v;
  }
  if (input.telefono !== undefined) {
    const v = normalizar(input.telefono);
    if (!esTextoNoVacio(v)) {
      throw new DatosPuntoAcopioInvalidosError(
        "Indica un teléfono de contacto del punto.",
      );
    }
    cambios.telefono = v;
  }
  if (input.telefonoEsWhatsApp !== undefined) {
    cambios.telefonoEsWhatsApp = input.telefonoEsWhatsApp;
  }
  if (input.correo !== undefined) {
    cambios.correo = input.correo?.trim() ? input.correo.trim() : null;
  }
  if (input.latitud !== undefined) {
    if (!esCoordenadaLatitud(input.latitud)) {
      throw new DatosPuntoAcopioInvalidosError(
        "La latitud debe estar entre -90 y 90.",
      );
    }
    cambios.latitud = normalizarCoordenada(input.latitud);
  }
  if (input.longitud !== undefined) {
    if (!esCoordenadaLongitud(input.longitud)) {
      throw new DatosPuntoAcopioInvalidosError(
        "La longitud debe estar entre -180 y 180.",
      );
    }
    cambios.longitud = normalizarCoordenada(input.longitud);
  }

  const tocaUbicacion =
    input.estadoId !== undefined || input.municipioId !== undefined;
  if (tocaUbicacion) {
    const estadoId = normalizar(input.estadoId ?? actual.estadoId);
    const municipioId = normalizar(input.municipioId ?? actual.municipioId);
    const validacion = await validarUbicacion(
      { estadoId, municipioId },
      catalogoUbicacion,
    );
    if (!validacion.ok) {
      throw new DatosPuntoAcopioInvalidosError(validacion.error);
    }
    cambios.estadoId = validacion.valor.estadoId;
    cambios.municipioId = validacion.valor.municipioId;
  }

  return puntos.actualizar(id, cambios);
}
