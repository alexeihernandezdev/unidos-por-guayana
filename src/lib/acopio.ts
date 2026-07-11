import {
  activarPuntoAcopio,
  archivarPuntoAcopio,
} from "@/modules/acopio/application/archivarPuntoAcopio";
import {
  crearPuntoAcopio,
  type CrearPuntoAcopioInput,
} from "@/modules/acopio/application/crearPuntoAcopio";
import {
  editarPuntoAcopio,
  type EditarPuntoAcopioInput,
} from "@/modules/acopio/application/editarPuntoAcopio";
import { listarPuntosDeAdmin } from "@/modules/acopio/application/listarPuntosDeAdmin";
import type { PuntoAcopio } from "@/modules/acopio/domain/PuntoAcopio";
import type { FiltroPuntosAcopio } from "@/modules/acopio/domain/PuntoAcopioRepository";
import { PrismaLectorUbicacionAdmin } from "@/modules/acopio/infrastructure/PrismaLectorUbicacionAdmin";
import { PrismaPuntoAcopioRepository } from "@/modules/acopio/infrastructure/PrismaPuntoAcopioRepository";
import { PrismaCatalogoUbicacionRepository } from "@/modules/ubicacion/infrastructure/PrismaCatalogoUbicacionRepository";

// ── Composition root ────────────────────────────────────────────────────────
// `src/lib` es infraestructura global (tech-stack.md): aquí se cablean los
// repos Prisma con los casos de uso puros. Se instancian una sola vez y se
// reutilizan. La presentación consume estos servicios a través de la fachada
// `@/shared/acopio` (no importa infraestructura ni lib directamente; ESLint lo
// hace cumplir).
const puntos = new PrismaPuntoAcopioRepository();
const ubicacionAdmin = new PrismaLectorUbicacionAdmin();
const catalogoUbicacion = new PrismaCatalogoUbicacionRepository();

export function crearPuntoAcopioServicio(
  adminId: string,
  input: CrearPuntoAcopioInput,
): Promise<PuntoAcopio> {
  return crearPuntoAcopio(
    { puntos, ubicacionAdmin, catalogoUbicacion },
    adminId,
    input,
  );
}

export function listarPuntosDeAdminServicio(
  adminId: string,
  filtro?: FiltroPuntosAcopio,
): Promise<PuntoAcopio[]> {
  return listarPuntosDeAdmin({ puntos }, adminId, filtro);
}

export function buscarPuntoAcopioServicio(
  id: string,
): Promise<PuntoAcopio | null> {
  return puntos.buscarPorId(id);
}

export function editarPuntoAcopioServicio(
  adminId: string,
  id: string,
  input: EditarPuntoAcopioInput,
): Promise<PuntoAcopio> {
  return editarPuntoAcopio({ puntos, catalogoUbicacion }, adminId, id, input);
}

export function archivarPuntoAcopioServicio(
  adminId: string,
  id: string,
): Promise<PuntoAcopio> {
  return archivarPuntoAcopio({ puntos }, adminId, id);
}

export function activarPuntoAcopioServicio(
  adminId: string,
  id: string,
): Promise<PuntoAcopio> {
  return activarPuntoAcopio({ puntos }, adminId, id);
}
