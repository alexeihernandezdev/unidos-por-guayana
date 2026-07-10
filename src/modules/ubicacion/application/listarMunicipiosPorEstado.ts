import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";
import type { Municipio } from "@/modules/ubicacion/domain/Ubicacion";

export type ListarMunicipiosPorEstadoDeps = {
  ubicacion: UbicacionRepository;
};

export function listarMunicipiosPorEstado(
  { ubicacion }: ListarMunicipiosPorEstadoDeps,
  estadoId: string,
): Promise<Municipio[]> {
  return ubicacion.listarMunicipiosPorEstado(estadoId);
}
