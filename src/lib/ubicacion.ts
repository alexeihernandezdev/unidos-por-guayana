import { obtenerCatalogoParaFormulario } from "@/modules/ubicacion/application/obtenerCatalogoParaFormulario";
import { listarEstados } from "@/modules/ubicacion/application/listarEstados";
import { listarMunicipiosPorEstado } from "@/modules/ubicacion/application/listarMunicipiosPorEstado";
import { validarUbicacionCatalogo } from "@/modules/ubicacion/application/validarUbicacionCatalogo";
import type { CatalogoUbicacionFormulario } from "@/modules/ubicacion/domain/Ubicacion";
import type { UbicacionSeleccion } from "@/modules/ubicacion/domain/Ubicacion";
import { PrismaUbicacionRepository } from "@/modules/ubicacion/infrastructure/PrismaUbicacionRepository";

const ubicacion = new PrismaUbicacionRepository();

export function obtenerCatalogoUbicacionServicio(): Promise<CatalogoUbicacionFormulario> {
  return obtenerCatalogoParaFormulario({ ubicacion });
}

export function listarEstadosServicio() {
  return listarEstados({ ubicacion });
}

export function listarMunicipiosPorEstadoServicio(estadoId: string) {
  return listarMunicipiosPorEstado({ ubicacion }, estadoId);
}

export function validarUbicacionCatalogoServicio(entrada: UbicacionSeleccion) {
  return validarUbicacionCatalogo({ ubicacion }, entrada);
}

export { UbicacionInvalidaError } from "@/modules/ubicacion/application/validarUbicacionCatalogo";
