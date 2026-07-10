import { listarEstados } from "@/modules/ubicaciones/application/listarEstados";
import { listarMunicipiosPorEstado } from "@/modules/ubicaciones/application/listarMunicipiosPorEstado";
import type {
  Estado,
  Municipio,
} from "@/modules/ubicaciones/domain/Ubicacion";
import { PrismaUbicacionRepository } from "@/modules/ubicaciones/infrastructure/PrismaUbicacionRepository";

const ubicaciones = new PrismaUbicacionRepository();

export function listarEstadosServicio(): Promise<Estado[]> {
  return listarEstados({ ubicaciones });
}

export function listarMunicipiosPorEstadoServicio(
  estadoId: string,
): Promise<Municipio[]> {
  return listarMunicipiosPorEstado({ ubicaciones }, estadoId);
}

export function obtenerMunicipioServicio(
  id: string,
): Promise<Municipio | null> {
  return ubicaciones.obtenerMunicipio(id);
}

export function obtenerEstadoServicio(id: string): Promise<Estado | null> {
  return ubicaciones.obtenerEstado(id);
}

/** Expuesto para validar pertenencia en casos de uso de usuarios. */
export function ubicacionesDeps() {
  return { ubicaciones };
}
