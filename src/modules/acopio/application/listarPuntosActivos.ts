import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import type {
  FiltroPuntosActivos,
  PuntoAcopioRepository,
} from "@/modules/acopio/domain/PuntoAcopioRepository";

export type ListarPuntosActivosDeps = {
  puntos: PuntoAcopioRepository;
};

/**
 * Lista los puntos de acopio **activos** de toda la red, para el colaborador
 * que busca dónde entregar ("¿a dónde llevo lo que aporto?"). Acotable por
 * estado/municipio del catálogo (feature 020). Nunca devuelve archivados.
 */
export async function listarPuntosActivos(
  { puntos }: ListarPuntosActivosDeps,
  filtro?: FiltroPuntosActivos,
): Promise<PuntoAcopio[]> {
  return puntos.listarActivos(filtro);
}

/**
 * Detalle de un punto para la vista del colaborador: solo si existe y está
 * activo; un punto archivado no se expone (devuelve `null`, la página hace 404).
 */
export async function verPuntoAcopioActivo(
  { puntos }: ListarPuntosActivosDeps,
  id: string,
): Promise<PuntoAcopio | null> {
  const punto = await puntos.buscarPorId(id);
  if (!punto || !punto.activo) return null;
  return punto;
}
