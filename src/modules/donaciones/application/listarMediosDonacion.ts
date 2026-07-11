import type { MedioDonacion } from "@/modules/donaciones/domain/MedioDonacion";
import type { MedioDonacionDeps } from "./deps";

/**
 * Lista todos los medios de donación (admin), activos e inactivos, ordenados por
 * `orden`. Feature 014.
 */
export function listarMediosDonacion(
  { medios }: MedioDonacionDeps,
): Promise<MedioDonacion[]> {
  return medios.listar();
}

/**
 * Lista solo los medios publicables (activos), ordenados por `orden`. Es la
 * lectura que consumen el tablero público (009) y demás superficies que invitan a
 * donar. Feature 014.
 */
export function listarMediosPublicables(
  { medios }: MedioDonacionDeps,
): Promise<MedioDonacion[]> {
  return medios.listarPublicables();
}
