import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { CerradaPor } from "@/modules/solicitudes/domain/CerradaPor";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { puedeCerrar } from "@/modules/solicitudes/domain/maquinaEstados";
import type { SolicitudDeps } from "./deps";
import {
  NoAutorizadoError,
  SolicitudNoEncontradaError,
  TransicionInvalidaError,
} from "./errors";

export async function cancelarSolicitud(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  id: string,
  solicitanteId: string,
): Promise<Solicitud> {
  const actual = await solicitudes.buscarPorId(id);
  if (!actual) {
    throw new SolicitudNoEncontradaError(id);
  }
  if (actual.solicitanteId !== solicitanteId) {
    throw new NoAutorizadoError(
      "Solo el solicitante dueño puede cancelar esta solicitud.",
    );
  }
  if (!puedeCerrar(actual.estado)) {
    throw new TransicionInvalidaError(
      "Solo se puede cancelar una solicitud ABIERTA.",
    );
  }

  return solicitudes.cambiarEstado(
    id,
    EstadoSolicitud.CERRADA,
    CerradaPor.SOLICITANTE,
  );
}
