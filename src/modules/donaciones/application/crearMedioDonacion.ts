import type { MedioDonacion } from "@/modules/donaciones/domain/MedioDonacion";
import {
  esDatosValido,
  esMonedaValida,
  esTitularValido,
  normalizarNotaMedio,
} from "@/modules/donaciones/domain/reglas";
import {
  esTipoMedioDonacion,
  type TipoMedioDonacion,
} from "@/modules/donaciones/domain/TipoMedioDonacion";
import type { MedioDonacionDeps } from "./deps";
import { DatosMedioInvalidosError } from "./errors";

export type CrearMedioDonacionInput = {
  tipo: TipoMedioDonacion;
  titular: string;
  moneda: string;
  datos: string;
  nota?: string | null;
  orden?: number;
};

/**
 * Da de alta un medio de donación externa (feature 014):
 * 1. Valida tipo, titular/datos no vacíos y moneda del conjunto permitido.
 * 2. Crea el medio `activo = true`.
 *
 * Caso de uso puro: solo depende de contratos de dominio. La app no procesa
 * ningún pago: esto es solo un dato para mostrar cómo donar.
 */
export async function crearMedioDonacion(
  { medios }: MedioDonacionDeps,
  input: CrearMedioDonacionInput,
): Promise<MedioDonacion> {
  const titular = input.titular.trim();
  const datos = input.datos.trim();
  const moneda = input.moneda.trim();

  if (!esTipoMedioDonacion(input.tipo)) {
    throw new DatosMedioInvalidosError("El tipo de medio no es válido.");
  }
  if (!esTitularValido(titular)) {
    throw new DatosMedioInvalidosError("Indica el titular del medio.");
  }
  if (!esDatosValido(datos)) {
    throw new DatosMedioInvalidosError(
      "Indica los datos de la instrucción (cuenta, correo, alias…).",
    );
  }
  if (!esMonedaValida(moneda)) {
    throw new DatosMedioInvalidosError("La moneda no es válida.");
  }

  return medios.crear({
    tipo: input.tipo,
    titular,
    moneda,
    datos,
    nota: normalizarNotaMedio(input.nota),
    orden: input.orden,
  });
}
