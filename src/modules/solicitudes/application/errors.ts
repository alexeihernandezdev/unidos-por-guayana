// Errores de los casos de uso de solicitudes. Son de dominio/aplicación (puros): la
// presentación los traduce a mensajes para el usuario.

export class SolicitudNoEncontradaError extends Error {
  constructor(id: string) {
    super(`No existe una solicitud con el id "${id}".`);
    this.name = "SolicitudNoEncontradaError";
  }
}

export class TransicionInvalidaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "TransicionInvalidaError";
  }
}

export class SolicitudNoEditableError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "SolicitudNoEditableError";
  }
}

export class NoAutorizadoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "NoAutorizadoError";
  }
}

export class RecursoInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "RecursoInvalidoError";
  }
}

export class DatosSolicitudInvalidosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosSolicitudInvalidosError";
  }
}
