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
import { registrarAporteDirecto, type RegistrarAporteDirectoInput } from "@/modules/aportes/application/registrarAporteDirecto";
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
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import { notificador } from "@/lib/notificaciones";
import {
  notificarEstadoAporte,
  notificarNuevoAporte,
} from "@/lib/eventosNotificaciones";

// ── Composition root ────────────────────────────────────────────────────────
// Cablea los repositorios Prisma (aportes + actividades + recursos) con los casos de
// uso puros. La presentación consume estos servicios a través de la fachada
// `@/shared/aportes`.
const aportes = new PrismaAporteRepository();
const actividades = new PrismaActividadRepository();
const recursos = new PrismaRecursoRepository();
const deps = { aportes, actividades, recursos };

export async function crearAporteServicio(input: CrearAporteInput): Promise<Aporte> {
  const aporte = await crearAporte(deps, input);
  await notificarNuevoAporte(aporte).catch((error) =>
    console.error("[notificaciones] No se pudo emitir NUEVO_APORTE:", error),
  );
  return aporte;
}

export async function cancelarAporteServicio(id: string, actor: Actor): Promise<void> {
  const aporte = await aportes.buscarPorId(id);
  await cancelarAporte(deps, id, actor);
  if (aporte) {
    await notificarEstadoAporte(aporte, actor.rol, "CANCELADO").catch((error) =>
      console.error("[notificaciones] No se pudo emitir ESTADO_APORTE:", error),
    );
  }
}

export async function marcarRecibidoServicio(
  id: string,
  actor: Actor,
): Promise<Aporte> {
  const aporte = await marcarRecibido(deps, id, actor);
  await notificarEstadoAporte(aporte, actor.rol, "RECIBIDO").catch((error) =>
    console.error("[notificaciones] No se pudo emitir ESTADO_APORTE:", error),
  );
  // Disparador META_CUMPLIDA (feature 012): si este aporte hace cruzar el 100% de
  // su meta por primera vez, avisa al admin dueño y a los aportantes de la meta.
  await notificarMetaCumplida(aporte);
  return aporte;
}

// Evalúa el cruce del 100% de la meta del recurso del aporte (antes vs después) y,
// si aplica, emite el aviso. La idempotencia por `claveDedupe` (una META_CUMPLIDA
// por meta) cubre reintentos. Best-effort: no debe romper el marcado del aporte.
async function notificarMetaCumplida(aporte: Aporte): Promise<void> {
  try {
    if (!aporte.actividadId) return;
    const actividad = await actividades.buscarPorId(aporte.actividadId);
    if (!actividad) return;
    const meta = actividad.metas.find((m) => m.recursoId === aporte.recursoId);
    if (!meta || meta.cantidadObjetivo <= 0) return;

    const agregados = await aportes.progresoPorActividad(aporte.actividadId);
    const recibidoDespues =
      agregados.find((a) => a.recursoId === aporte.recursoId)?.recibido ?? 0;
    const recibidoAntes = recibidoDespues - aporte.cantidad;
    const cruzaCien =
      recibidoAntes < meta.cantidadObjetivo &&
      recibidoDespues >= meta.cantidadObjetivo;
    if (!cruzaCien) return;

    const recibidos = await aportes.listarPorActividad(aporte.actividadId, {
      estado: EstadoAporte.RECIBIDO,
    });
    const aportantes = recibidos
      .filter((a) => a.recursoId === aporte.recursoId && a.colaboradorId)
      .map((a) => a.colaboradorId as string);
    const destinatarioIds = [...new Set([actividad.adminId, ...aportantes])];

    await notificador.emitir({
      tipo: TipoNotificacion.META_CUMPLIDA,
      actividadId: actividad.id,
      sectorDestino: actividad.sectorDestino,
      recursoId: aporte.recursoId,
      recursoNombre: meta.recurso?.nombre ?? "el recurso",
      destinatarioIds,
    });
  } catch (error) {
    console.error("[notificaciones] No se pudo emitir META_CUMPLIDA:", error);
  }
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

export function registrarAporteDirectoServicio(
  input: RegistrarAporteDirectoInput,
  actor: Actor,
): Promise<Aporte> {
  return registrarAporteDirecto(deps, input, actor);
}

export function listarIngresosExternosServicio(): Promise<Aporte[]> {
  return listarIngresosExternos(deps);
}
