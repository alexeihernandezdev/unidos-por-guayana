import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";

// Módulo `atenciones` (feature 030): puente explícito entre una necesidad concreta de
// una Solicitud (`RecursoSolicitud`) y la meta de la Actividad que la atiende
// (`MetaRecurso`). El ADMIN lo crea arrastrando necesidades del sidebar a una actividad.
// La "atención" no muta el estado de la Solicitud: la cobertura es un dato DERIVADO que
// se calcula al leer (ver decisión de la feature: cobertura derivada).

// Una necesidad pendiente: un recurso pedido en una solicitud `ABIERTA` que aún no tiene
// atención. Es cada tarjeta arrastrable del sidebar. `seleccionable` refleja si el
// recurso es `APROBADO` **y** `activo`: si no lo es, no puede convertirse en meta y la
// tarjeta se muestra deshabilitada.
export type NecesidadPendiente = {
  recursoSolicitudId: string;
  solicitudId: string;
  sector: string;
  urgencia: UrgenciaSolicitud;
  solicitanteNombre: string;
  cantidadEstimada: number | null;
  recurso: {
    id: string;
    nombre: string;
    unidad: string;
    categoria: CategoriaRecurso;
    seleccionable: boolean;
  };
};

// Datos mínimos de una necesidad para validar un vínculo (caso de uso `vincular`).
export type NecesidadInfo = {
  recursoSolicitudId: string;
  recursoId: string;
  cantidadEstimada: number | null;
  solicitudAbierta: boolean;
  yaAtendida: boolean;
  recursoSeleccionable: boolean;
  recursoNombre: string;
};

// Datos mínimos de una atención existente para validar un desvínculo (`desvincular`).
export type AtencionInfo = {
  atencionId: string;
  actividadId: string;
};

// Proyección de lectura para el display inverso ("Atendido por actividad X"): a qué
// actividad está vinculado un `RecursoSolicitud`, o `null` si sigue pendiente.
export type AtencionDeRecurso = {
  atencionId: string;
  actividadId: string;
  actividadTitulo: string;
};
