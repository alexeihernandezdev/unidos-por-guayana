// Errores de los casos de uso de recursos. Son de dominio/aplicación (puros): la
// presentación los traduce a mensajes para el usuario.

export class NombreDuplicadoError extends Error {
  constructor(nombre: string) {
    super(`Ya existe un recurso con el nombre "${nombre}".`);
    this.name = "NombreDuplicadoError";
  }
}

export class RecursoNoEncontradoError extends Error {
  constructor(id: string) {
    super(`No existe un recurso con el id "${id}".`);
    this.name = "RecursoNoEncontradoError";
  }
}

export class DatosRecursoInvalidosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosRecursoInvalidosError";
  }
}

// Feature 019 · errores del ciclo de revisión de propuestas.

export class PropuestaNoEncontradaError extends Error {
  constructor(id: string) {
    super(`No existe una propuesta de recurso con el id "${id}".`);
    this.name = "PropuestaNoEncontradaError";
  }
}

export class TransicionAprobacionInvalidaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "TransicionAprobacionInvalidaError";
  }
}
