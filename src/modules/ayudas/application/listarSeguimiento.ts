import type {
  SeguimientoEvento,
  SeguimientoEventoPublico,
} from "@/modules/ayudas/domain/SeguimientoEvento";
import type { AyudaDeps } from "./deps";

/**
 * Historial de seguimiento completo de una Ayuda, para la gestión del ADMIN.
 * Incluye `registradoPor` (auditoría interna). Orden cronológico ascendente
 * (lo garantiza el repositorio).
 */
export async function listarSeguimiento(
  { ayudas }: Pick<AyudaDeps, "ayudas">,
  ayudaId: string,
): Promise<SeguimientoEvento[]> {
  return ayudas.listarSeguimiento(ayudaId);
}

/**
 * Misma traza que `listarSeguimiento` pero **omitiendo `registradoPor`**: es la
 * ÚNICA puerta pública al historial (feature 009). Nunca debe filtrar identidades,
 * por eso descarta el campo de forma explícita al mapear.
 */
export async function listarSeguimientoPublico(
  deps: Pick<AyudaDeps, "ayudas">,
  ayudaId: string,
): Promise<SeguimientoEventoPublico[]> {
  const eventos = await deps.ayudas.listarSeguimiento(ayudaId);
  // Construye la vista pública campo a campo, omitiendo `registradoPor`: así el
  // filtro es explícito y no depende de un descarte por desestructuración.
  return eventos.map(
    (evento): SeguimientoEventoPublico => ({
      id: evento.id,
      ayudaId: evento.ayudaId,
      estadoAnterior: evento.estadoAnterior,
      estadoNuevo: evento.estadoNuevo,
      nota: evento.nota,
      evidenciaUrl: evento.evidenciaUrl,
      ocurridoEn: evento.ocurridoEn,
    }),
  );
}
