// Errores de los casos de uso de actividades. Son de dominio/aplicación (puros): la
// presentación los traduce a mensajes para el usuario.

export class ActividadNoEncontradaError extends Error {
  constructor(id: string) {
    super(`No existe una actividad con el id "${id}".`);
    this.name = "ActividadNoEncontradaError";
  }
}

// Se lanza cuando se asocia un `puntoAcopioId` inexistente, archivado o de otro
// ADMIN (feature 024). El punto debe pertenecer al dueño de la actividad.
export class PuntoAcopioInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "PuntoAcopioInvalidoError";
  }
}

// Se lanza al intentar avanzar el estado por una transición que no permite la
// máquina de estados (saltar, retroceder o avanzar desde el estado terminal).
export class TransicionInvalidaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "TransicionInvalidaError";
  }
}

// Se lanza al intentar editar cabecera/metas (o eliminar) una actividad que ya no
// está en `RECOLECTANDO`.
export class ActividadNoEditableError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ActividadNoEditableError";
  }
}

// Se lanza cuando una meta referencia un recurso inexistente o archivado.
export class RecursoInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "RecursoInvalidoError";
  }
}

// Datos de la actividad o de una meta que no cumplen las reglas (título/sector
// vacío, cantidad no positiva, recurso repetido, sin metas).
export class DatosActividadInvalidosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosActividadInvalidosError";
  }
}

// Se lanza cuando un ADMIN intenta gestionar una actividad que no le pertenece
// (feature 022). La capa `app` lo traduce a 404 para no filtrar existencia.
export class ActividadNoPerteneceAlAdminError extends Error {
  constructor(actividadId: string) {
    super(`La actividad "${actividadId}" no pertenece al administrador solicitante.`);
    this.name = "ActividadNoPerteneceAlAdminError";
  }
}

// ── Archivos (feature 033) ──

// Archivo con tipo MIME o tamaño fuera de lo permitido, o ruta que no corresponde.
export class ArchivoInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ArchivoInvalidoError";
  }
}

// Se alcanzó el cupo de documentos adjuntos de la actividad.
export class LimiteArchivosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "LimiteArchivosError";
  }
}

export class ArchivoNoEncontradoError extends Error {
  constructor(id: string) {
    super(`No existe un archivo con el id "${id}".`);
    this.name = "ArchivoNoEncontradoError";
  }
}
