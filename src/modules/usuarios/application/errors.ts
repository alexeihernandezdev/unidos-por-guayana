// Errores de los casos de uso de usuarios. Son de dominio/aplicación (puros): la
// presentación los traduce a mensajes para el usuario.

export class RolNoAutoRegistrableError extends Error {
  constructor(rol: string) {
    super(`El rol "${rol}" no puede auto-registrarse.`);
    this.name = "RolNoAutoRegistrableError";
  }
}

export class EmailYaRegistradoError extends Error {
  constructor(email: string) {
    super(`Ya existe un usuario con el email "${email}".`);
    this.name = "EmailYaRegistradoError";
  }
}
