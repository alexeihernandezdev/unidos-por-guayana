import type { LectorUbicacionAdmin } from "@/modules/acopio/domain/LectorUbicacionAdmin";
import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import type { PuntoAcopioRepository } from "@/modules/acopio/domain/PuntoAcopioRepository";
import {
  aplicarHerenciaUbicacion,
  esCoordenadaLatitud,
  esCoordenadaLongitud,
  esTextoNoVacio,
  normalizar,
  normalizarCoordenada,
} from "@/modules/acopio/domain/reglas";
import type { CatalogoUbicacionRepository } from "@/modules/ubicacion/domain/CatalogoUbicacionRepository";
import { validarUbicacion } from "@/modules/ubicacion/domain/validarUbicacion";
import {
  DatosPuntoAcopioInvalidosError,
  UbicacionVaciaError,
} from "./errors";

export type CrearPuntoAcopioDeps = {
  puntos: PuntoAcopioRepository;
  ubicacionAdmin: LectorUbicacionAdmin;
  catalogoUbicacion: CatalogoUbicacionRepository;
};

export type CrearPuntoAcopioInput = {
  nombre: string;
  referencia: string;
  latitud: string;
  longitud: string;
  horarios: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string | null;
  // Ambos pueden venir vacíos: se heredan del PerfilAdmin del ADMIN dueño.
  estadoId: string;
  municipioId: string;
};

/**
 * Alta de un punto de acopio para el `ADMIN` dueño (feature 011).
 *
 * 1. Normaliza y valida los campos de texto y las coordenadas.
 * 2. Aplica la herencia de ubicación desde el `PerfilAdmin` cuando la entrada
 *    no la trae; si tras la herencia sigue vacía, lanza `UbicacionVaciaError`.
 * 3. Valida coherencia estado↔municipio contra el catálogo (feature 020).
 * 4. Persiste. El error de nombre duplicado por admin lo lanza el repo.
 */
export async function crearPuntoAcopio(
  { puntos, ubicacionAdmin, catalogoUbicacion }: CrearPuntoAcopioDeps,
  adminId: string,
  input: CrearPuntoAcopioInput,
): Promise<PuntoAcopio> {
  const nombre = normalizar(input.nombre);
  const referencia = normalizar(input.referencia);
  const horarios = normalizar(input.horarios);
  const telefono = normalizar(input.telefono);
  const correo = input.correo?.trim() ? input.correo.trim() : null;

  if (!esTextoNoVacio(nombre)) {
    throw new DatosPuntoAcopioInvalidosError("Indica el nombre del centro.");
  }
  if (!esTextoNoVacio(referencia)) {
    throw new DatosPuntoAcopioInvalidosError(
      "Indica una referencia para orientar a quien va a llegar.",
    );
  }
  if (!esTextoNoVacio(horarios)) {
    throw new DatosPuntoAcopioInvalidosError("Indica los horarios de atención.");
  }
  if (!esTextoNoVacio(telefono)) {
    throw new DatosPuntoAcopioInvalidosError(
      "Indica un teléfono de contacto del centro.",
    );
  }
  if (!esCoordenadaLatitud(input.latitud)) {
    throw new DatosPuntoAcopioInvalidosError(
      "La latitud debe estar entre -90 y 90.",
    );
  }
  if (!esCoordenadaLongitud(input.longitud)) {
    throw new DatosPuntoAcopioInvalidosError(
      "La longitud debe estar entre -180 y 180.",
    );
  }

  const heredada = await ubicacionAdmin.leerPorAdminId(adminId);
  const ubicacion = aplicarHerenciaUbicacion(
    { estadoId: input.estadoId, municipioId: input.municipioId },
    heredada,
  );
  if (!ubicacion) {
    throw new UbicacionVaciaError();
  }

  const validacion = await validarUbicacion(ubicacion, catalogoUbicacion);
  if (!validacion.ok) {
    throw new DatosPuntoAcopioInvalidosError(validacion.error);
  }

  return puntos.crear({
    adminId,
    nombre,
    referencia,
    latitud: normalizarCoordenada(input.latitud),
    longitud: normalizarCoordenada(input.longitud),
    horarios,
    telefono,
    telefonoEsWhatsApp: input.telefonoEsWhatsApp,
    correo,
    estadoId: validacion.valor.estadoId,
    municipioId: validacion.valor.municipioId,
  });
}
