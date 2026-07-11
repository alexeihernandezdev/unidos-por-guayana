import { prisma } from "@/lib/prisma";
import type { CatalogoUbicacionRepository } from "@/modules/ubicacion/domain/CatalogoUbicacionRepository";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";

// Implementación del puerto sobre Prisma (feature 020). Los modelos de Prisma
// (`estados`, `municipios`) comparten forma con las entidades de dominio, así que
// las filas son asignables sin conversiones. Ordena por nombre para poblar los
// desplegables de forma legible.
export class PrismaCatalogoUbicacionRepository
  implements CatalogoUbicacionRepository
{
  async buscarEstado(id: string): Promise<Estado | null> {
    return prisma.estado.findUnique({
      where: { id },
      select: { id: true, codigo: true, nombre: true },
    });
  }

  async buscarMunicipio(id: string): Promise<Municipio | null> {
    return prisma.municipio.findUnique({
      where: { id },
      select: { id: true, codigo: true, nombre: true, estadoId: true },
    });
  }

  async listarEstados(): Promise<Estado[]> {
    return prisma.estado.findMany({
      select: { id: true, codigo: true, nombre: true },
      orderBy: { nombre: "asc" },
    });
  }

  async listarMunicipios(): Promise<Municipio[]> {
    return prisma.municipio.findMany({
      select: { id: true, codigo: true, nombre: true, estadoId: true },
      orderBy: { nombre: "asc" },
    });
  }

  async listarMunicipiosDeEstado(estadoId: string): Promise<Municipio[]> {
    return prisma.municipio.findMany({
      where: { estadoId },
      select: { id: true, codigo: true, nombre: true, estadoId: true },
      orderBy: { nombre: "asc" },
    });
  }
}
