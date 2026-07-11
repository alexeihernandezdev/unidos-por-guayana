import {
  activarMedioDonacion,
  desactivarMedioDonacion,
} from "@/modules/donaciones/application/cambiarActivoMedioDonacion";
import {
  crearMedioDonacion,
  type CrearMedioDonacionInput,
} from "@/modules/donaciones/application/crearMedioDonacion";
import {
  editarMedioDonacion,
  type EditarMedioDonacionInput,
} from "@/modules/donaciones/application/editarMedioDonacion";
import {
  listarMediosDonacion,
  listarMediosPublicables,
} from "@/modules/donaciones/application/listarMediosDonacion";
import type { MedioDonacion } from "@/modules/donaciones/domain/MedioDonacion";
import { PrismaMedioDonacionRepository } from "@/modules/donaciones/infrastructure/PrismaMedioDonacionRepository";

// ── Composition root ────────────────────────────────────────────────────────
// `src/lib` es infraestructura global (tech-stack.md): aquí se cablea el
// repositorio Prisma con los casos de uso puros. Se instancia una sola vez y se
// reutiliza. La presentación consume estos servicios a través de la fachada
// `@/shared/donaciones` (no importa infraestructura ni lib directamente; ESLint lo
// hace cumplir).
const medios = new PrismaMedioDonacionRepository();
const deps = { medios };

export function crearMedioDonacionServicio(
  input: CrearMedioDonacionInput,
): Promise<MedioDonacion> {
  return crearMedioDonacion(deps, input);
}

export function editarMedioDonacionServicio(
  id: string,
  input: EditarMedioDonacionInput,
): Promise<MedioDonacion> {
  return editarMedioDonacion(deps, id, input);
}

export function activarMedioDonacionServicio(
  id: string,
): Promise<MedioDonacion> {
  return activarMedioDonacion(deps, id);
}

export function desactivarMedioDonacionServicio(
  id: string,
): Promise<MedioDonacion> {
  return desactivarMedioDonacion(deps, id);
}

export function buscarMedioDonacionServicio(
  id: string,
): Promise<MedioDonacion | null> {
  return medios.buscarPorId(id);
}

export function listarMediosDonacionServicio(): Promise<MedioDonacion[]> {
  return listarMediosDonacion(deps);
}

export function listarMediosPublicablesServicio(): Promise<MedioDonacion[]> {
  return listarMediosPublicables(deps);
}
