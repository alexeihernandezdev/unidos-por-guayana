import { cancelarAporte } from "@/modules/aportes/application/cancelarAporte";
import {
  crearAporte,
  type CrearAporteInput,
} from "@/modules/aportes/application/crearAporte";
import type { Actor } from "@/modules/aportes/application/deps";
import {
  listarAportesDeColaborador,
  listarAportesPorAyuda,
  listarAportesRecientes,
} from "@/modules/aportes/application/listarAportes";
import { listarAportantesDeAyuda } from "@/modules/aportes/application/listarAportantesDeAyuda";
import { marcarRecibido } from "@/modules/aportes/application/marcarRecibido";
import { progresoDeAyuda } from "@/modules/aportes/application/progresoDeAyuda";
import { revertirRecibido } from "@/modules/aportes/application/revertirRecibido";
import type { Aporte, ProgresoMetaDetalle } from "@/modules/aportes/domain/Aporte";
import type {
  AportanteDeAyuda,
  FiltroAportes,
} from "@/modules/aportes/domain/AporteRepository";
import { PrismaAporteRepository } from "@/modules/aportes/infrastructure/PrismaAporteRepository";
import { PrismaAyudaRepository } from "@/modules/ayudas/infrastructure/PrismaAyudaRepository";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";

// ── Composition root ────────────────────────────────────────────────────────
// Cablea los repositorios Prisma (aportes + ayudas + recursos) con los casos de
// uso puros. La presentación consume estos servicios a través de la fachada
// `@/shared/aportes`.
const aportes = new PrismaAporteRepository();
const ayudas = new PrismaAyudaRepository();
const recursos = new PrismaRecursoRepository();
const deps = { aportes, ayudas, recursos };

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

export function listarAportesPorAyudaServicio(
  ayudaId: string,
  filtro?: FiltroAportes,
): Promise<Aporte[]> {
  return listarAportesPorAyuda(deps, ayudaId, filtro);
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

export function listarAportantesDeAyudaServicio(
  ayudaId: string,
): Promise<AportanteDeAyuda[]> {
  return listarAportantesDeAyuda(deps, ayudaId);
}

export function progresoDeAyudaServicio(
  ayudaId: string,
): Promise<ProgresoMetaDetalle[]> {
  return progresoDeAyuda(deps, ayudaId);
}
