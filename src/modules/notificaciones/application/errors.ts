// Errores de aplicación de notificaciones (feature 012).

export class NotificacionNoEncontradaError extends Error {
  constructor(id: string) {
    super(`No existe la notificación ${id}.`);
    this.name = "NotificacionNoEncontradaError";
  }
}

export class NoAutorizadoError extends Error {
  constructor(mensaje = "No puedes modificar esta notificación.") {
    super(mensaje);
    this.name = "NoAutorizadoError";
  }
}
