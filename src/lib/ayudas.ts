import { avanzarEstado } from "@/modules/ayudas/application/avanzarEstado";
import {
  crearAyuda,
  type CrearAyudaInput,
} from "@/modules/ayudas/application/crearAyuda";
import {
  editarCabecera,
  type EditarCabeceraInput,
} from "@/modules/ayudas/application/editarCabecera";
import { eliminarAyuda } from "@/modules/ayudas/application/eliminarAyuda";
import {
  guardarMeta,
  quitarMeta,
} from "@/modules/ayudas/application/gestionarMetas";
import { listarAyudas } from "@/modules/ayudas/application/listarAyudas";
import { obtenerAyuda } from "@/modules/ayudas/application/obtenerAyuda";
import type { Ayuda, NuevaMeta } from "@/modules/ayudas/domain/Ayuda";
import type { FiltroAyudas } from "@/modules/ayudas/domain/AyudaRepository";
import { PrismaAyudaRepository } from "@/modules/ayudas/infrastructure/PrismaAyudaRepository";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";

// ── Composition root ────────────────────────────────────────────────────────
// `src/lib` es infraestructura global (tech-stack.md): aquí se cablean los
// repositorios Prisma (ayudas + recursos, para validar metas contra el catálogo)
// con los casos de uso puros. Se instancian una sola vez y se reutilizan. La
// presentación consume estos servicios a través de la fachada `@/shared/ayudas`.
const ayudas = new PrismaAyudaRepository();
const recursos = new PrismaRecursoRepository();
const deps = { ayudas, recursos };

export function crearAyudaServicio(input: CrearAyudaInput): Promise<Ayuda> {
  return crearAyuda(deps, input);
}

export function listarAyudasServicio(filtro?: FiltroAyudas): Promise<Ayuda[]> {
  return listarAyudas(deps, filtro);
}

export function obtenerAyudaServicio(id: string): Promise<Ayuda> {
  return obtenerAyuda(deps, id);
}

export function editarCabeceraServicio(
  id: string,
  input: EditarCabeceraInput,
): Promise<Ayuda> {
  return editarCabecera(deps, id, input);
}

export function guardarMetaServicio(
  ayudaId: string,
  meta: NuevaMeta,
): Promise<Ayuda> {
  return guardarMeta(deps, ayudaId, meta);
}

export function quitarMetaServicio(
  ayudaId: string,
  recursoId: string,
): Promise<Ayuda> {
  return quitarMeta(deps, ayudaId, recursoId);
}

export function avanzarEstadoServicio(id: string): Promise<Ayuda> {
  return avanzarEstado(deps, id);
}

export function eliminarAyudaServicio(id: string): Promise<void> {
  return eliminarAyuda(deps, id);
}
