import { type AtencionDeps, assertActividadOperable } from "./deps";
import { AtencionNoEncontradaError } from "./errors";

/**
 * Desvincula una necesidad de una actividad (borra la `AtencionNecesidad`): la necesidad
 * vuelve al sidebar como pendiente. La meta que se hubiera creado se conserva; el ADMIN
 * la quita por separado si ya no la quiere. Reglas:
 * 1. La atención existe.
 * 2. La actividad a la que pertenece es del ADMIN y sigue en `RECOLECTANDO`.
 */
export async function desvincularNecesidad(
  { atenciones, actividades }: AtencionDeps,
  adminId: string,
  atencionId: string,
): Promise<void> {
  const atencion = await atenciones.buscarAtencion(atencionId);
  if (!atencion) {
    throw new AtencionNoEncontradaError(atencionId);
  }

  await assertActividadOperable(actividades, atencion.actividadId, adminId);

  await atenciones.desvincular(atencionId);
}
