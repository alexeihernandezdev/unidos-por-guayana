import type { Afiliacion } from "@/modules/afiliaciones/domain/Afiliacion";
import type { AfiliacionDeps } from "./deps";
import { NoAutorizadoError } from "./errors";

/**
 * Afilia un COLABORADOR a un ADMIN (centro de acopio). Unilateral e inmediato (sin
 * aprobación) e idempotente: afiliarse dos veces no duplica el vínculo. Solo el
 * propio colaborador dispara esto (el id sale de su sesión).
 */
export async function afiliarseACentro(
  { afiliaciones }: Pick<AfiliacionDeps, "afiliaciones">,
  colaboradorId: string,
  adminId: string,
): Promise<Afiliacion> {
  return afiliaciones.afiliar(colaboradorId, adminId);
}

/**
 * Un COLABORADOR deja un centro al que estaba afiliado (desde `/mi-perfil`).
 */
export async function dejarCentro(
  { afiliaciones }: Pick<AfiliacionDeps, "afiliaciones">,
  colaboradorId: string,
  adminId: string,
): Promise<void> {
  await afiliaciones.remover(colaboradorId, adminId);
}

/**
 * Un ADMIN remueve a un colaborador de **su** red. Comprueba la propiedad: si ese
 * colaborador no está afiliado a este admin, lanza `NoAutorizadoError` (un admin no
 * puede tocar la red de otro). Remover no bloquea: el colaborador puede volver a
 * afiliarse cuando quiera.
 */
export async function removerDeRed(
  { afiliaciones }: Pick<AfiliacionDeps, "afiliaciones">,
  adminId: string,
  colaboradorId: string,
): Promise<void> {
  const afiliacion = await afiliaciones.buscar(colaboradorId, adminId);
  if (!afiliacion) {
    throw new NoAutorizadoError();
  }
  await afiliaciones.remover(colaboradorId, adminId);
}
