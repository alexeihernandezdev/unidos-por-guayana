import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { desvincularNecesidad } from "@/modules/atenciones/application/desvincularNecesidad";
import { listarNecesidadesPendientes } from "@/modules/atenciones/application/listarNecesidadesPendientes";
import {
  type NecesidadFallida,
  vincularNecesidad,
  vincularNecesidades,
} from "@/modules/atenciones/application/vincularNecesidad";
import type { NecesidadPendiente } from "@/modules/atenciones/domain/Atencion";
import { PrismaAtencionRepository } from "@/modules/atenciones/infrastructure/PrismaAtencionRepository";

// ── Composition root ────────────────────────────────────────────────────────
// Cablea el repositorio de atenciones (puente actividad↔solicitud, feature 030) con el
// de actividades (para validar dueño y estado editable) y expone los servicios que
// consume la presentación a través de `@/shared/atenciones`.
const atenciones = new PrismaAtencionRepository();
const actividades = new PrismaActividadRepository();
const deps = { atenciones, actividades };

export function listarNecesidadesPendientesServicio(): Promise<
  NecesidadPendiente[]
> {
  return listarNecesidadesPendientes(deps);
}

export function vincularNecesidadServicio(
  actividadId: string,
  adminId: string,
  recursoSolicitudId: string,
): Promise<void> {
  return vincularNecesidad(deps, actividadId, adminId, recursoSolicitudId);
}

export function vincularNecesidadesServicio(
  actividadId: string,
  adminId: string,
  recursoSolicitudIds: readonly string[],
): Promise<NecesidadFallida[]> {
  return vincularNecesidades(deps, actividadId, adminId, recursoSolicitudIds);
}

export function desvincularNecesidadServicio(
  adminId: string,
  atencionId: string,
): Promise<void> {
  return desvincularNecesidad(deps, adminId, atencionId);
}
