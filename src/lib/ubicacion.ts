import {
  cargarCatalogoUbicacion as cargarCatalogoUbicacionCaso,
  listarEstados as listarEstadosCaso,
  listarMunicipiosDeEstado as listarMunicipiosDeEstadoCaso,
  type CatalogoUbicacion,
} from "@/modules/ubicacion/application/listarCatalogo";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import { PrismaCatalogoUbicacionRepository } from "@/modules/ubicacion/infrastructure/PrismaCatalogoUbicacionRepository";

// ── Composition root del catálogo de ubicación (feature 020) ──────────────────
// `src/lib` es infraestructura global: cablea el repositorio Prisma con los casos
// de uso puros. La instancia se reutiliza y se inyecta también en los casos de
// uso de `usuarios` (ver `src/lib/auth.ts`).
export const catalogoUbicacion = new PrismaCatalogoUbicacionRepository();

/** Catálogo completo (estados + municipios) para el selector dependiente. */
export function cargarCatalogoUbicacion(): Promise<CatalogoUbicacion> {
  return cargarCatalogoUbicacionCaso(catalogoUbicacion);
}

export function listarEstadosUbicacion(): Promise<Estado[]> {
  return listarEstadosCaso(catalogoUbicacion);
}

export function listarMunicipiosDeEstado(
  estadoId: string,
): Promise<Municipio[]> {
  return listarMunicipiosDeEstadoCaso(catalogoUbicacion, estadoId);
}
