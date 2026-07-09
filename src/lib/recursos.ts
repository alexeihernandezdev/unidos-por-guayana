import {
  activarRecurso,
  archivarRecurso,
} from "@/modules/recursos/application/archivarRecurso";
import {
  crearRecurso,
  type CrearRecursoInput,
} from "@/modules/recursos/application/crearRecurso";
import {
  editarRecurso,
  type EditarRecursoInput,
} from "@/modules/recursos/application/editarRecurso";
import { listarRecursos } from "@/modules/recursos/application/listarRecursos";
import type { Recurso } from "@/modules/recursos/domain/Recurso";
import type { FiltroRecursos } from "@/modules/recursos/domain/RecursoRepository";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";

// ── Composition root ────────────────────────────────────────────────────────
// `src/lib` es infraestructura global (tech-stack.md): aquí se cablea el
// repositorio Prisma con los casos de uso puros. Se instancia una sola vez y se
// reutiliza. La presentación consume estos servicios a través de la fachada
// `@/shared/recursos` (no importa infraestructura ni lib directamente; ESLint lo
// hace cumplir).
const recursos = new PrismaRecursoRepository();

export function crearRecursoServicio(
  input: CrearRecursoInput,
): Promise<Recurso> {
  return crearRecurso({ recursos }, input);
}

export function listarRecursosServicio(
  filtro?: FiltroRecursos,
): Promise<Recurso[]> {
  return listarRecursos({ recursos }, filtro);
}

export function buscarRecursoServicio(id: string): Promise<Recurso | null> {
  return recursos.buscarPorId(id);
}

export function editarRecursoServicio(
  id: string,
  input: EditarRecursoInput,
): Promise<Recurso> {
  return editarRecurso({ recursos }, id, input);
}

export function archivarRecursoServicio(id: string): Promise<Recurso> {
  return archivarRecurso({ recursos }, id);
}

export function activarRecursoServicio(id: string): Promise<Recurso> {
  return activarRecurso({ recursos }, id);
}
