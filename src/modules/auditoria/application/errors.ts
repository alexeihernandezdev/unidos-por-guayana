export class SoloAuditorError extends Error {
  constructor() {
    super("Solo un auditor activo puede realizar esta acción.");
    this.name = "SoloAuditorError";
  }
}

export class SolicitudAuditoriaNoEncontradaError extends Error {
  constructor() {
    super("La solicitud no existe o ya no está disponible para esta acción.");
    this.name = "SolicitudAuditoriaNoEncontradaError";
  }
}

export class ConflictoAuditoriaError extends Error {
  constructor(mensaje = "La solicitud cambió de estado. Actualiza la página.") {
    super(mensaje);
    this.name = "ConflictoAuditoriaError";
  }
}

export class DictamenAuditoriaInvalidoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "DictamenAuditoriaInvalidoError";
  }
}

// ── Evidencia de verificación (feature 032) ──

export class EvidenciaInvalidaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "EvidenciaInvalidaError";
  }
}

export class LimiteEvidenciasError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "LimiteEvidenciasError";
  }
}

export class EvidenciaNoEncontradaError extends Error {
  constructor() {
    super("La evidencia ya no existe.");
    this.name = "EvidenciaNoEncontradaError";
  }
}
