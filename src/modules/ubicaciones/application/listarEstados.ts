import type { Estado } from "@/modules/ubicaciones/domain/Ubicacion";
import type { UbicacionRepository } from "@/modules/ubicaciones/domain/UbicacionRepository";

export type ListarEstadosDeps = {
  ubicaciones: Pick<UbicacionRepository, "listarEstados">;
};

export function listarEstados({
  ubicaciones,
}: ListarEstadosDeps): Promise<Estado[]> {
  return ubicaciones.listarEstados();
}
