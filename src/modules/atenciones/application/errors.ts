// Errores de los casos de uso de atenciones (feature 030). Puros: la presentación los
// traduce a mensajes para el usuario.

// La necesidad (`RecursoSolicitud`) indicada no existe.
export class NecesidadNoEncontradaError extends Error {
  constructor(id: string) {
    super(`No existe la necesidad "${id}".`);
    this.name = "NecesidadNoEncontradaError";
  }
}

// Se intenta atender una necesidad cuya solicitud ya no está `ABIERTA` (fue atendida
// manualmente o cerrada): dejó de ser arrastrable.
export class NecesidadNoPendienteError extends Error {
  constructor() {
    super("La solicitud de esta necesidad ya no está abierta.");
    this.name = "NecesidadNoPendienteError";
  }
}

// Se intenta atender una necesidad que ya está vinculada a una actividad (posible
// carrera: otro ADMIN la tomó primero).
export class NecesidadYaAtendidaError extends Error {
  constructor() {
    super("Esta necesidad ya está siendo atendida por una actividad.");
    this.name = "NecesidadYaAtendidaError";
  }
}

// El recurso de la necesidad no es seleccionable (no está `APROBADO` y `activo`), así
// que no puede convertirse en meta de la actividad.
export class RecursoNoSeleccionableError extends Error {
  constructor(nombre: string) {
    super(`El recurso "${nombre}" no está aprobado o está archivado.`);
    this.name = "RecursoNoSeleccionableError";
  }
}

// La atención indicada no existe (al intentar desvincular).
export class AtencionNoEncontradaError extends Error {
  constructor(id: string) {
    super(`No existe la atención "${id}".`);
    this.name = "AtencionNoEncontradaError";
  }
}
