// Errores de los casos de uso de acopio (feature 011). De aplicación (puros);
// la presentación los traduce a mensajes para el usuario.

export class PuntoAcopioNoEncontradoError extends Error {
  constructor(id: string) {
    super(`No existe un punto de acopio con el id "${id}".`);
    this.name = "PuntoAcopioNoEncontradoError";
  }
}

// Enforcement por propiedad: un ADMIN intenta operar sobre un punto ajeno.
export class PuntoAcopioAjenoError extends Error {
  constructor() {
    super("No puedes operar sobre un punto de acopio que no es tuyo.");
    this.name = "PuntoAcopioAjenoError";
  }
}

export class DatosPuntoAcopioInvalidosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosPuntoAcopioInvalidosError";
  }
}

// Ubicación no resuelta tras aplicar la herencia (perfil admin sin ubicación
// y formulario sin ubicación). Se separa de `DatosInvalidos` para que la UI
// pueda dirigir al admin a `/panel/perfil` a completar su ubicación primero.
export class UbicacionVaciaError extends Error {
  constructor() {
    super(
      "Selecciona el estado y el municipio del punto (o completa tu perfil).",
    );
    this.name = "UbicacionVaciaError";
  }
}

// Nombre duplicado dentro del mismo admin (`@@unique([adminId, nombre])`).
export class NombrePuntoDuplicadoError extends Error {
  constructor(nombre: string) {
    super(`Ya tienes un punto de acopio llamado "${nombre}".`);
    this.name = "NombrePuntoDuplicadoError";
  }
}
