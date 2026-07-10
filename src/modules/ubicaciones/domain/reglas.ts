import type { UbicacionCatalogo } from "./Ubicacion";
import type { UbicacionRepository } from "./UbicacionRepository";

export type ResultadoValidacionUbicacion<T> =
  | { ok: true; valor: T }
  | { ok: false; error: string };

export type ValidarUbicacionCatalogoDeps = {
  ubicaciones: Pick<UbicacionRepository, "obtenerMunicipio">;
};

/**
 * Valida que `estadoId` y `municipioId` estén presentes y que el municipio
 * pertenezca al estado. Mensajes en español para el formulario.
 */
export async function validarUbicacionCatalogo(
  entrada: { estadoId: string; municipioId: string },
  { ubicaciones }: ValidarUbicacionCatalogoDeps,
): Promise<ResultadoValidacionUbicacion<UbicacionCatalogo>> {
  const estadoId = entrada.estadoId.trim();
  const municipioId = entrada.municipioId.trim();

  if (estadoId.length === 0) {
    return { ok: false, error: "Selecciona el estado." };
  }
  if (municipioId.length === 0) {
    return { ok: false, error: "Selecciona el municipio." };
  }

  const municipio = await ubicaciones.obtenerMunicipio(municipioId);
  if (!municipio || municipio.estadoId !== estadoId) {
    return {
      ok: false,
      error: "El municipio no pertenece al estado seleccionado.",
    };
  }

  return { ok: true, valor: { estadoId, municipioId } };
}
