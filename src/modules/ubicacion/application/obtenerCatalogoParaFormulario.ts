import {
  agruparCatalogoParaFormulario,
  type CatalogoUbicacionFormulario,
} from "@/modules/ubicacion/domain/Ubicacion";
import type { UbicacionRepository } from "@/modules/ubicacion/domain/UbicacionRepository";

export type ObtenerCatalogoFormularioDeps = {
  ubicacion: UbicacionRepository;
};

export async function obtenerCatalogoParaFormulario({
  ubicacion,
}: ObtenerCatalogoFormularioDeps): Promise<CatalogoUbicacionFormulario> {
  const [estados, municipios] = await Promise.all([
    ubicacion.listarEstados(),
    ubicacion.listarTodosLosMunicipios(),
  ]);
  return agruparCatalogoParaFormulario(estados, municipios);
}
