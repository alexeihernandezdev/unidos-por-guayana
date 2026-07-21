import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { EstadoVerificacionSolicitud } from "@/modules/auditoria/domain/EstadoVerificacionSolicitud";
import { puedeMarcarAtendida } from "@/modules/solicitudes/domain/maquinaEstados";
import type { SolicitudDeps } from "./deps";
import {
  SolicitudNoEncontradaError,
  TransicionInvalidaError,
} from "./errors";

export async function marcarAtendida(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  id: string,
): Promise<Solicitud> {
  const actual = await solicitudes.buscarPorId(id);
  if (!actual) {
    throw new SolicitudNoEncontradaError(id);
  }
  if (!puedeMarcarAtendida(actual.estado)) {
    throw new TransicionInvalidaError(
      "Solo se puede marcar atendida una solicitud ABIERTA.",
    );
  }
  if (
    actual.estadoVerificacion !== EstadoVerificacionSolicitud.VERIFICADA
  ) {
    throw new TransicionInvalidaError(
      "La solicitud debe estar verificada por auditoría antes de ser atendida.",
    );
  }

  return solicitudes.cambiarEstado(id, EstadoSolicitud.ATENDIDA);
}
