// Errores de los casos de uso de afiliaciones (feature 025). Puros: la presentación
// los traduce a mensajes para el usuario.

// Un ADMIN intenta remover de su red a alguien que no está afiliado a él (o que
// pertenece a la red de otro). La app lo trata como acción no permitida.
export class NoAutorizadoError extends Error {
  constructor(mensaje = "No puedes remover a este colaborador de tu red.") {
    super(mensaje);
    this.name = "NoAutorizadoError";
  }
}

// Un COLABORADOR intenta guardar sin declarar ninguna categoría de aporte.
export class CategoriasVaciasError extends Error {
  constructor(mensaje = "Elige al menos una categoría que podrías aportar.") {
    super(mensaje);
    this.name = "CategoriasVaciasError";
  }
}
