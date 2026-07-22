// Evidencia física de verificación subida por un AUDITOR (feature 032). Interna:
// la ven auditores y administradores, nunca el solicitante ni el público.

export type ArchivoEvidenciaAuditoria = {
  id: string;
  solicitudId: string;
  /** Auditor que la subió. `null` si su cuenta fue eliminada (FK SetNull). */
  subidoPorId: string | null;
  subidoPorNombre: string | null;
  /** Ciclo de auditoría en el que se registró la evidencia. */
  ciclo: number;
  /** Ruta del objeto en el bucket (no URL). */
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
  createdAt: Date;
};

export type NuevaEvidenciaAuditoria = {
  solicitudId: string;
  subidoPorId: string;
  ciclo: number;
  path: string;
  nombreOriginal: string;
  contentType: string;
  tamanoBytes: number;
};
