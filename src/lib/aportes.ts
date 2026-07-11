import { cancelarAporte } from "@/modules/aportes/application/cancelarAporte";
import {
  crearAporte,
  type CrearAporteInput,
} from "@/modules/aportes/application/crearAporte";
import type { Actor } from "@/modules/aportes/application/deps";
import {
  listarAportesDeColaborador,
  listarAportesPorActividad,
  listarAportesRecientes,
} from "@/modules/aportes/application/listarAportes";
import { listarAportantesDeActividad } from "@/modules/aportes/application/listarAportantesDeActividad";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { listarIngresosExternos } from "@/modules/aportes/application/listarIngresosExternos";
import { registrarAporteExterno, type RegistrarAporteExternoInput } from "@/modules/aportes/application/registrarAporteExterno";
import { progresoDeActividad } from "@/modules/aportes/application/progresoDeActividad";
import { revertirRecibido } from "@/modules/aportes/application/revertirRecibido";
import type { Aporte, ProgresoMetaDetalle } from "@/modules/aportes/domain/Aporte";
import type {
  AportanteDeActividad,
  FiltroAportes,
} from "@/modules/aportes/domain/AporteRepository";
import { PrismaAporteRepository } from "@/modules/aportes/infrastructure/PrismaAporteRepository";
import { PrismaActividadRepository } from "@/modules/actividades/infrastructure/PrismaActividadRepository";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";

// ── Composition root ────────────────────────────────────────────────────────
// Cablea los repositorios Prisma (aportes + actividades + recursos) con los casos de
// uso puros. La presentación consume estos servicios a través de la fachada
// `@/shared/aportes`.
const aportes = new PrismaAporteRepository();
const actividades = new PrismaActividadRepository();
const recursos = new PrismaRecursoRepository();
const deps = { aportes, actividades, recursos };

export function crearAporteServicio(input: CrearAporteInput): Promise<Aporte> {
  return crearAporte(deps, input);
}

export function cancelarAporteServicio(id: string, actor: Actor): Promise<void> {
  return cancelarAporte(deps, id, actor);
}

export function marcarRecibidoServicio(id: string, actor: Actor): Promise<Aporte> {
  return marcarRecibido(deps, id, actor);
}

export function revertirRecibidoServicio(
  id: string,
  actor: Actor,
): Promise<Aporte> {
  return revertirRecibido(deps, id, actor);
}

export function listarAportesPorActividadServicio(
  actividadId: string,
  filtro?: FiltroAportes,
): Promise<Aporte[]> {
  return listarAportesPorActividad(deps, actividadId, filtro);
}

export function listarAportesDeColaboradorServicio(
  colaboradorId: string,
): Promise<Aporte[]> {
  return listarAportesDeColaborador(deps, colaboradorId);
}

export function listarAportesRecientesServicio(
  limit: number,
): Promise<Aporte[]> {
  return listarAportesRecientes(deps, limit);
}

export function listarAportantesDeActividadServicio(
  actividadId: string,
): Promise<AportanteDeActividad[]> {
  return listarAportantesDeActividad(deps, actividadId);
}

export function progresoDeActividadServicio(
  actividadId: string,
): Promise<ProgresoMetaDetalle[]> {
  return progresoDeActividad(deps, actividadId);
}

export function registrarAporteExternoServicio(
  input: RegistrarAporteExternoInput,
  actor: Actor,
): Promise<Aporte> {
  return registrarAporteExterno(deps, input, actor);
}

export function listarIngresosExternosServicio(): Promise<Aporte[]> {
  return listarIngresosExternos(deps);
}
