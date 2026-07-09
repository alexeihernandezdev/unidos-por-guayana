import type { Solicitud } from "@/modules/solicitudes/domain/Solicitud";
import { CerradaPor } from "@/modules/solicitudes/domain/CerradaPor";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { puedeCerrar } from "@/modules/solicitudes/domain/maquinaEstados";
import type { SolicitudDeps } from "./deps";
import {
  SolicitudNoEncontradaError,
  TransicionInvalidaError,
} from "./errors";

export async function cerrarSolicitud(
  { solicitudes }: Pick<SolicitudDeps, "solicitudes">,
  id: string,
): Promise<Solicitud> {
  const actual = await solicitudes.buscarPorId(id);
  if (!actual) {
    throw new SolicitudNoEncontradaError(id);
  }
  if (!puedeCerrar(actual.estado)) {
    throw new TransicionInvalidaError(
      "Solo se puede cerrar una solicitud ABIERTA.",
    );
  }

  return solicitudes.cambiarEstado(
    id,
    EstadoSolicitud.CERRADA,
    CerradaPor.ADMIN,
  );
}
