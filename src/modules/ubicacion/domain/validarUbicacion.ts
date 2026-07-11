import type { CatalogoUbicacionRepository } from "./CatalogoUbicacionRepository";

// Validación de coherencia estado↔municipio (feature 020). Dominio puro: recibe
// el catálogo por el puerto (no importa Prisma) y devuelve el valor normalizado
// listo para persistir o un error tipado con el mensaje en español que verá el
// usuario. La consumen los casos de uso de `usuarios` (registro/edición) para
// tener una sola fuente de verdad de la regla, independiente de si el formulario
// se saltó la validación de cliente.

export type UbicacionSeleccionada = {
  estadoId: string;
  municipioId: string;
};

export type ResultadoUbicacion =
  | { ok: true; valor: UbicacionSeleccionada }
  | { ok: false; error: string };

/**
 * Valida que `estadoId` y `municipioId` estén presentes, existan en el catálogo
 * y que el municipio pertenezca al estado elegido. Asíncrono porque consulta el
 * catálogo por el puerto; sigue siendo puro (determinista, sin efectos).
 *
 * Mensajes (spec 020):
 * - estado vacío → "Selecciona el estado."
 * - municipio vacío → "Selecciona el municipio."
 * - estado inexistente → "El estado seleccionado no es válido."
 * - municipio inexistente → "El municipio seleccionado no es válido."
 * - municipio de otro estado → "El municipio no pertenece al estado seleccionado."
 */
export async function validarUbicacion(
  entrada: { estadoId: string; municipioId: string },
  catalogo: CatalogoUbicacionRepository,
): Promise<ResultadoUbicacion> {
  const estadoId = entrada.estadoId?.trim() ?? "";
  const municipioId = entrada.municipioId?.trim() ?? "";

  if (estadoId.length === 0) {
    return { ok: false, error: "Selecciona el estado." };
  }
  if (municipioId.length === 0) {
    return { ok: false, error: "Selecciona el municipio." };
  }

  const estado = await catalogo.buscarEstado(estadoId);
  if (!estado) {
    return { ok: false, error: "El estado seleccionado no es válido." };
  }

  const municipio = await catalogo.buscarMunicipio(municipioId);
  if (!municipio) {
    return { ok: false, error: "El municipio seleccionado no es válido." };
  }

  if (municipio.estadoId !== estado.id) {
    return {
      ok: false,
      error: "El municipio no pertenece al estado seleccionado.",
    };
  }

  return { ok: true, valor: { estadoId: estado.id, municipioId: municipio.id } };
}
