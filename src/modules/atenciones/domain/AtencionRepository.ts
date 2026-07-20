import type {
  AtencionInfo,
  NecesidadInfo,
  NecesidadPendiente,
} from "./Atencion";

// Contrato de persistencia del puente actividad↔solicitud (feature 030). La
// implementación concreta (Prisma) vive en infraestructura; el dominio solo declara
// la interfaz.
export interface AtencionRepository {
  // Necesidades pendientes: recursos de solicitudes `ABIERTA` sin atención. Alimenta el
  // sidebar arrastrable. Ordenadas por urgencia y antigüedad de la solicitud.
  listarNecesidadesPendientes(): Promise<NecesidadPendiente[]>;

  // Datos de una necesidad para validar el vínculo, o `null` si no existe.
  buscarNecesidad(recursoSolicitudId: string): Promise<NecesidadInfo | null>;

  // Datos de una atención existente para validar el desvínculo, o `null` si no existe.
  buscarAtencion(atencionId: string): Promise<AtencionInfo | null>;

  // Crea el vínculo de forma transaccional: hace `find-or-create` de la meta del
  // `recursoId` en la actividad (`cantidadObjetivo` solo aplica al crearla; si ya
  // existe, no se toca) y crea la `AtencionNecesidad`. La unicidad de
  // `recursoSolicitudId` impide atender dos veces la misma necesidad.
  vincular(datos: {
    recursoSolicitudId: string;
    actividadId: string;
    recursoId: string;
    cantidadObjetivo: number;
  }): Promise<void>;

  // Borra el vínculo por su id. La meta creada se conserva (el ADMIN la quita aparte).
  desvincular(atencionId: string): Promise<void>;
}
