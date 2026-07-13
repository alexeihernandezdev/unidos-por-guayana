import {
  afiliarseACentro,
  dejarCentro,
  removerDeRed,
} from "@/modules/afiliaciones/application/gestionarAfiliacion";
import {
  contarAptosPorCategoria,
  listarCentrosDisponibles,
  listarDestinatariosConvocatoria,
  listarMiRed,
  listarRedAptaPorCategoria,
  type CentroConAfiliacion,
  type RedAptaPorCategoria,
} from "@/modules/afiliaciones/application/consultarRed";
import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type {
  Afiliacion,
  MiembroRed,
} from "@/modules/afiliaciones/domain/Afiliacion";
import type { ConteoPorCategoria } from "@/modules/afiliaciones/domain/AfiliacionRepository";
import type { FiltroCentros } from "@/modules/afiliaciones/domain/LectorCentrosDisponibles";
import { PrismaAfiliacionRepository } from "@/modules/afiliaciones/infrastructure/PrismaAfiliacionRepository";
import { PrismaLectorCentrosDisponibles } from "@/modules/afiliaciones/infrastructure/PrismaLectorCentrosDisponibles";

// ── Composition root (feature 025) ───────────────────────────────────────────
// Cablea el repositorio Prisma de afiliaciones y el lector de centros disponibles
// con los casos de uso puros. La presentación consume vía `@/shared/afiliaciones`.
const afiliaciones = new PrismaAfiliacionRepository();
const centros = new PrismaLectorCentrosDisponibles();
const deps = { afiliaciones, centros };

export function afiliarseACentroServicio(
  colaboradorId: string,
  adminId: string,
): Promise<Afiliacion> {
  return afiliarseACentro(deps, colaboradorId, adminId);
}

export function dejarCentroServicio(
  colaboradorId: string,
  adminId: string,
): Promise<void> {
  return dejarCentro(deps, colaboradorId, adminId);
}

export function removerDeRedServicio(
  adminId: string,
  colaboradorId: string,
): Promise<void> {
  return removerDeRed(deps, adminId, colaboradorId);
}

export function listarMiRedServicio(
  adminId: string,
  filtroCategoria?: CategoriaRecurso,
): Promise<MiembroRed[]> {
  return listarMiRed(deps, adminId, filtroCategoria);
}

export function contarAptosPorCategoriaServicio(
  adminId: string,
): Promise<ConteoPorCategoria> {
  return contarAptosPorCategoria(deps, adminId);
}

export function listarRedAptaPorCategoriaServicio(
  adminId: string,
): Promise<RedAptaPorCategoria> {
  return listarRedAptaPorCategoria(deps, adminId);
}

export function listarCentrosDisponiblesServicio(
  colaboradorId: string,
  filtro?: FiltroCentros,
): Promise<CentroConAfiliacion[]> {
  return listarCentrosDisponibles(deps, colaboradorId, filtro);
}

export function listarDestinatariosConvocatoriaServicio(
  adminId: string,
  categorias: readonly CategoriaRecurso[],
): Promise<string[]> {
  return listarDestinatariosConvocatoria(deps, adminId, categorias);
}
