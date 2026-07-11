// Errores de los casos de uso de donaciones (feature 014). Son de
// dominio/aplicación (puros): la presentación los traduce a mensajes para el
// usuario.

export class MedioDonacionNoEncontradoError extends Error {
  constructor(id: string) {
    super(`No existe un medio de donación con el id "${id}".`);
    this.name = "MedioDonacionNoEncontradoError";
  }
}

// Titular/datos vacíos, moneda fuera del conjunto permitido, tipo no válido.
export class DatosMedioInvalidosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosMedioInvalidosError";
  }
}
