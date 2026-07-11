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

// ── Datos de contacto y ubicación (feature 017) ───────────────────────────────

// La entrada no cumple las reglas de dominio (cédula/teléfono/estado/parroquia).
// El mensaje describe el primer problema encontrado, en español y listo para
// mostrar al usuario.
export class DatosContactoInvalidosError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DatosContactoInvalidosError";
  }
}

// Ya existe otra cuenta con la cédula normalizada indicada.
export class CedulaYaRegistradaError extends Error {
  constructor() {
    super("Ya existe una cuenta con esta cédula.");
    this.name = "CedulaYaRegistradaError";
  }
}

// ── Categorías de aporte del colaborador (feature 025) ────────────────────────

// Un COLABORADOR intenta registrarse o guardar sin declarar ninguna categoría de
// aporte válida (debe elegir al menos una de las cuatro).
export class CategoriasAporteVaciasError extends Error {
  constructor(
    mensaje = "Elige al menos una categoría de recurso que podrías aportar.",
  ) {
    super(mensaje);
    this.name = "CategoriasAporteVaciasError";
  }
}

// ── Gestión de administradores por el SUPERADMIN (feature 015) ────────────────

// El actor de una acción reservada al `SUPERADMIN` no lo es.
export class SoloSuperadminError extends Error {
  constructor() {
    super("Solo el superadministrador puede realizar esta acción.");
    this.name = "SoloSuperadminError";
  }
}

// La cuenta objetivo no existe.
export class UsuarioNoEncontradoError extends Error {
  constructor(id: string) {
    super(`No existe un usuario con el id "${id}".`);
    this.name = "UsuarioNoEncontradoError";
  }
}

// La cuenta objetivo no es un `ADMIN` en `PENDIENTE`, o la transición de
// verificación solicitada no es válida.
export class CuentaAdminNoAprobableError extends Error {
  constructor(mensaje = "La cuenta no está pendiente de aprobación.") {
    super(mensaje);
    this.name = "CuentaAdminNoAprobableError";
  }
}

// ── Perfil de administrador / centro de acopio (feature 016) ──────────────────

// Los datos del perfil no cumplen las reglas de dominio (documento sin tipo o
// número, correo/teléfono vacíos, etc.). El mensaje describe el primer problema.
export class PerfilAdminInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "PerfilAdminInvalidoError";
  }
}

// Ya existe un `PerfilAdmin` para ese `usuarioId` (uno por cuenta).
export class PerfilAdminDuplicadoError extends Error {
  constructor(usuarioId: string) {
    super(`La cuenta "${usuarioId}" ya tiene un perfil de administrador.`);
    this.name = "PerfilAdminDuplicadoError";
  }
}

// No existe un `PerfilAdmin` para ese `usuarioId`.
export class PerfilAdminNoEncontradoError extends Error {
  constructor(usuarioId: string) {
    super(`La cuenta "${usuarioId}" no tiene un perfil de administrador.`);
    this.name = "PerfilAdminNoEncontradoError";
  }
}
