// Errores de los casos de uso de aportes. Son de dominio/aplicación (puros): la
// presentación los traduce a mensajes para el usuario.

export class AporteNoEncontradoError extends Error {
  constructor(id: string) {
    super(`No existe un aporte con el id "${id}".`);
    this.name = "AporteNoEncontradoError";
  }
}

// Se lanza al intentar aportar (o cancelar) sobre una Ayuda que ya no está en
// `RECOLECTANDO`: metas y aportes quedan congelados tras `LISTO`.
export class AyudaNoAceptaAportesError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "AyudaNoAceptaAportesError";
  }
}

// Se lanza si el recurso del aporte no está entre las metas de la Ayuda, o si el
// recurso no existe / está archivado.
export class RecursoFueraDeMetasError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "RecursoFueraDeMetasError";
  }
}

// Se lanza al intentar una transición que la máquina de estados no permite (por
// ejemplo, marcar recibido un aporte ya RECIBIDO, o revertir uno COMPROMETIDO).
export class TransicionInvalidaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "TransicionInvalidaError";
  }
}

// Cantidad no positiva, nota demasiado larga, etc.
export class DatosAporteInvalidosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosAporteInvalidosError";
  }
}

// Se lanza cuando el actor no tiene permisos para la operación (por ejemplo,
// un colaborador intentando cancelar el aporte de otro).
export class NoAutorizadoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "NoAutorizadoError";
  }
}

// ── Ingreso monetario externo (feature 014) ─────────────────────────────────

// Se lanza al registrar un ingreso monetario sobre un recurso cuya categoría no
// es `MONETARIO` (o el recurso no existe).
export class RecursoNoMonetarioError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "RecursoNoMonetarioError";
  }
}

// Se lanza cuando el monto de un ingreso monetario no es positivo, o la moneda es
// inválida / falta.
export class MontoInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "MontoInvalidoError";
  }
}
