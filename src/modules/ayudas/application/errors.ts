// Errores de los casos de uso de ayudas. Son de dominio/aplicación (puros): la
// presentación los traduce a mensajes para el usuario.

export class AyudaNoEncontradaError extends Error {
  constructor(id: string) {
    super(`No existe una ayuda con el id "${id}".`);
    this.name = "AyudaNoEncontradaError";
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

// Se lanza al intentar editar cabecera/metas (o eliminar) una ayuda que ya no está
// en `RECOLECTANDO`.
export class AyudaNoEditableError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "AyudaNoEditableError";
  }
}

// Se lanza cuando una meta referencia un recurso inexistente o archivado.
export class RecursoInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "RecursoInvalidoError";
  }
}

// Datos de la ayuda o de una meta que no cumplen las reglas (título/sector vacío,
// cantidad no positiva, recurso repetido, sin metas).
export class DatosAyudaInvalidosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosAyudaInvalidosError";
  }
}

// Se lanza cuando un ADMIN intenta gestionar una actividad que no le pertenece
// (feature 022). La capa `app` lo traduce a 404 para no filtrar existencia.
export class ActividadNoPerteneceAlAdminError extends Error {
  constructor(ayudaId: string) {
    super(`La actividad "${ayudaId}" no pertenece al administrador solicitante.`);
    this.name = "ActividadNoPerteneceAlAdminError";
  }
}
