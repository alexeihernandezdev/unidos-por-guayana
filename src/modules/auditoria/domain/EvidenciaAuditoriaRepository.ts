import type {
  ArchivoEvidenciaAuditoria,
  NuevaEvidenciaAuditoria,
} from "./ArchivoEvidenciaAuditoria";

// Persistencia de la evidencia de auditoría (feature 032). Interfaz separada de
// `AuditoriaRepository` para no acoplar el flujo de dictamen con el de archivos; el
// adaptador Prisma implementa ambas.
export interface EvidenciaAuditoriaRepository {
  crearEvidencia(
    input: NuevaEvidenciaAuditoria,
  ): Promise<ArchivoEvidenciaAuditoria>;
  listarEvidencias(solicitudId: string): Promise<ArchivoEvidenciaAuditoria[]>;
  buscarEvidenciaPorId(
    id: string,
  ): Promise<ArchivoEvidenciaAuditoria | null>;
  eliminarEvidencia(id: string): Promise<void>;
  contarEvidencias(solicitudId: string): Promise<number>;
}
