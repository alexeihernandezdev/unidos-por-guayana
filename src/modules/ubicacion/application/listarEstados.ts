import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";
import type { Estado } from "@/modules/ubicacion/domain/Ubicacion";

export type ListarEstadosDeps = {
  ubicacion: UbicacionRepository;
};

export function listarEstados({ ubicacion }: ListarEstadosDeps): Promise<Estado[]> {
  return ubicacion.listarEstados();
}
