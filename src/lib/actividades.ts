import { avanzarEstado } from "@/modules/actividades/application/avanzarEstado";
import {
  crearActividad,
  type CrearActividadInput,
} from "@/modules/actividades/application/crearActividad";
import {
  editarCabecera,
  type EditarCabeceraInput,
} from "@/modules/actividades/application/editarCabecera";
import { eliminarActividad } from "@/modules/actividades/application/eliminarActividad";
import {
  guardarMeta,
  quitarMeta,
} from "@/modules/actividades/application/gestionarMetas";
import { listarActividades } from "@/modules/actividades/application/listarActividades";
import { obtenerActividad } from "@/modules/actividades/application/obtenerActividad";
import type { Actividad, NuevaMeta } from "@/modules/actividades/domain/Actividad";
import type { FiltroActividades } from "@/modules/actividades/domain/ActividadRepository";
import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";
import { PrismaPuntoAcopioRepository } from "@/modules/acopio/infrastructure/PrismaPuntoAcopioRepository";

// ── Composition root ────────────────────────────────────────────────────────
// `src/lib` es infraestructura global (tech-stack.md): aquí se cablean los
// repositorios Prisma (actividades + recursos para validar metas contra el catálogo,
// y puntos de acopio para validar el `puntoAcopioId` opcional de la feature 024) con
// los casos de uso puros. Se instancian una sola vez y se reutilizan. La presentación
// consume estos servicios a través de la fachada `@/shared/actividades`.
const actividades = new PrismaActividadRepository();
const recursos = new PrismaRecursoRepository();
const puntos = new PrismaPuntoAcopioRepository();
const deps = { actividades, recursos, puntos };

export function crearActividadServicio(input: CrearActividadInput): Promise<Actividad> {
  return crearActividad(deps, input);
}

export function listarActividadesServicio(filtro?: FiltroActividades): Promise<Actividad[]> {
  return listarActividades(deps, filtro);
}

export function obtenerActividadServicio(
  id: string,
  adminId?: string,
): Promise<Actividad> {
  return obtenerActividad(deps, id, adminId);
}

export function editarCabeceraServicio(
  id: string,
  adminId: string,
  input: EditarCabeceraInput,
): Promise<Actividad> {
  return editarCabecera(deps, id, adminId, input);
}

export function guardarMetaServicio(
  actividadId: string,
  adminId: string,
  meta: NuevaMeta,
): Promise<Actividad> {
  return guardarMeta(deps, actividadId, adminId, meta);
}

export function quitarMetaServicio(
  actividadId: string,
  adminId: string,
  recursoId: string,
): Promise<Actividad> {
  return quitarMeta(deps, actividadId, adminId, recursoId);
}

export function avanzarEstadoServicio(
  id: string,
  adminId: string,
): Promise<Actividad> {
  return avanzarEstado(deps, id, adminId);
}

export function eliminarActividadServicio(
  id: string,
  adminId: string,
): Promise<void> {
  return eliminarActividad(deps, id, adminId);
}
