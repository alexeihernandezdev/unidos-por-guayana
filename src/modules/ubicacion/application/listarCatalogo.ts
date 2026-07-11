import type { CatalogoUbicacionRepository } from "@/modules/ubicacion/domain/CatalogoUbicacionRepository";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";

// Casos de uso de lectura del catálogo (feature 020). Puros: solo dependen del
// puerto. Pueblan los desplegables del selector dependiente.

/** Lista las 24 entidades federales para el primer desplegable. */
export function listarEstados(
  catalogo: CatalogoUbicacionRepository,
): Promise<Estado[]> {
  return catalogo.listarEstados();
}

/** Lista los municipios de un estado para el segundo desplegable (filtrado). */
export function listarMunicipiosDeEstado(
  catalogo: CatalogoUbicacionRepository,
  estadoId: string,
): Promise<Municipio[]> {
  return catalogo.listarMunicipiosDeEstado(estadoId);
}

export type CatalogoUbicacion = {
  estados: Estado[];
  municipios: Municipio[];
};

/**
 * Carga el catálogo completo (estados + todos los municipios) para pasarlo al
 * selector dependiente en el cliente. ≈335 municipios es poco: se precarga todo
 * y el filtrado estado→municipio ocurre en el cliente, sin nuevas APIs.
 */
export async function cargarCatalogoUbicacion(
  catalogo: CatalogoUbicacionRepository,
): Promise<CatalogoUbicacion> {
  const [estados, municipios] = await Promise.all([
    catalogo.listarEstados(),
    catalogo.listarMunicipios(),
  ]);
  return { estados, municipios };
}
