import type {
  CambiosMedioDonacion,
  MedioDonacion,
} from "@/modules/donaciones/domain/MedioDonacion";
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
import { DatosMedioInvalidosError, MedioDonacionNoEncontradoError } from "./errors";

export type EditarMedioDonacionInput = {
  tipo: TipoMedioDonacion;
  titular: string;
  moneda: string;
  datos: string;
  nota?: string | null;
  orden?: number;
};

/**
 * Edita un medio de donación (feature 014). Valida las mismas reglas que el alta
 * y persiste los cambios. No toca `activo` (eso se hace con activar/desactivar).
 */
export async function editarMedioDonacion(
  { medios }: MedioDonacionDeps,
  id: string,
  input: EditarMedioDonacionInput,
): Promise<MedioDonacion> {
  const existente = await medios.buscarPorId(id);
  if (!existente) throw new MedioDonacionNoEncontradoError(id);

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

  const cambios: CambiosMedioDonacion = {
    tipo: input.tipo,
    titular,
    moneda,
    datos,
    nota: normalizarNotaMedio(input.nota),
  };
  if (input.orden !== undefined) cambios.orden = input.orden;

  return medios.actualizar(id, cambios);
}
