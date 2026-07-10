import type { Municipio } from "@/modules/ubicaciones/domain/Ubicacion";
import type { UbicacionRepository } from "@/modules/ubicaciones/domain/UbicacionRepository";

export type ListarMunicipiosPorEstadoDeps = {
  ubicaciones: Pick<UbicacionRepository, "listarMunicipiosPorEstado">;
};

export function listarMunicipiosPorEstado(
  { ubicaciones }: ListarMunicipiosPorEstadoDeps,
  estadoId: string,
): Promise<Municipio[]> {
  const id = estadoId.trim();
  if (id.length === 0) return Promise.resolve([]);
  return ubicaciones.listarMunicipiosPorEstado(id);
}
