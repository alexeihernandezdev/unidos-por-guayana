import {
  cancelarSolicitud,
} from "@/modules/solicitudes/application/cancelarSolicitud";
import {
  cerrarSolicitud,
} from "@/modules/solicitudes/application/cerrarSolicitud";
import {
  crearSolicitud,
  type CrearSolicitudInput,
} from "@/modules/solicitudes/application/crearSolicitud";
import {
  editarSolicitud,
  type EditarSolicitudInput,
} from "@/modules/solicitudes/application/editarSolicitud";
import {
  listarMisSolicitudes,
  listarSolicitudes,
} from "@/modules/solicitudes/application/listarSolicitudes";
import { marcarAtendida } from "@/modules/solicitudes/application/marcarAtendida";
import { obtenerSolicitud } from "@/modules/solicitudes/application/obtenerSolicitud";
import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import type { FiltroSolicitudes } from "@/modules/solicitudes/domain/SolicitudRepository";
import { PrismaSolicitudRepository } from "@/modules/solicitudes/infrastructure/PrismaSolicitudRepository";
import { PrismaRecursoRepository } from "@/modules/recursos/infrastructure/PrismaRecursoRepository";

const solicitudes = new PrismaSolicitudRepository();
const recursos = new PrismaRecursoRepository();
const deps = { solicitudes, recursos };

export function crearSolicitudServicio(
  input: CrearSolicitudInput,
  solicitanteId: string,
): Promise<Solicitud> {
  return crearSolicitud(deps, input, solicitanteId);
}

export function listarMisSolicitudesServicio(
  solicitanteId: string,
): Promise<Solicitud[]> {
  return listarMisSolicitudes(deps, solicitanteId);
}

export function listarSolicitudesServicio(
  filtro?: FiltroSolicitudes,
): Promise<Solicitud[]> {
  return listarSolicitudes(deps, filtro);
}

export function obtenerSolicitudServicio(id: string): Promise<Solicitud> {
  return obtenerSolicitud(deps, id);
}

export function editarSolicitudServicio(
  id: string,
  input: EditarSolicitudInput,
  actorId: string,
): Promise<Solicitud> {
  return editarSolicitud(deps, id, input, actorId);
}

export function cancelarSolicitudServicio(
  id: string,
  solicitanteId: string,
): Promise<Solicitud> {
  return cancelarSolicitud(deps, id, solicitanteId);
}

export function marcarAtendidaServicio(id: string): Promise<Solicitud> {
  return marcarAtendida(deps, id);
}

export function cerrarSolicitudServicio(id: string): Promise<Solicitud> {
  return cerrarSolicitud(deps, id);
}
