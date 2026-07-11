import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type {
  CentroDisponible,
  MiembroRed,
} from "@/modules/afiliaciones/domain/Afiliacion";
import type { ConteoPorCategoria } from "@/modules/afiliaciones/domain/AfiliacionRepository";
import type { FiltroCentros } from "@/modules/afiliaciones/domain/LectorCentrosDisponibles";
import type { AfiliacionDeps } from "./deps";

/** Red del ADMIN logueado: sus colaboradores afiliados, filtrable por categoría. */
export async function listarMiRed(
  { afiliaciones }: Pick<AfiliacionDeps, "afiliaciones">,
  adminId: string,
  filtroCategoria?: CategoriaRecurso,
): Promise<MiembroRed[]> {
  return afiliaciones.listarRed(adminId, filtroCategoria);
}

/**
 * Cuántos colaboradores VERIFICADOS de la red del ADMIN declaran cada categoría.
 * Alimenta el conteo de aptos que se muestra al elegir el recurso de una meta al
 * crear/editar una Actividad (feature 025).
 */
export async function contarAptosPorCategoria(
  { afiliaciones }: Pick<AfiliacionDeps, "afiliaciones">,
  adminId: string,
): Promise<ConteoPorCategoria> {
  return afiliaciones.contarAptosPorCategoria(adminId);
}

// Centro disponible con la marca de si el colaborador ya está afiliado a él.
export type CentroConAfiliacion = CentroDisponible & { yaAfiliado: boolean };

/**
 * Centros de acopio disponibles para afiliarse (ADMIN verificados con su perfil y
 * puntos activos), filtrables por ubicación, marcando los que el colaborador ya
 * tiene. Requiere el puerto `centros`.
 */
export async function listarCentrosDisponibles(
  { afiliaciones, centros }: AfiliacionDeps,
  colaboradorId: string,
  filtro?: FiltroCentros,
): Promise<CentroConAfiliacion[]> {
  if (!centros) return [];
  const [lista, misAdmins] = await Promise.all([
    centros.listar(filtro),
    afiliaciones.listarAdminIdsDeColaborador(colaboradorId),
  ]);
  const afiliados = new Set(misAdmins);
  return lista.map((centro) => ({
    ...centro,
    yaAfiliado: afiliados.has(centro.adminId),
  }));
}

/**
 * Destinatarios de la convocatoria de una Actividad (feature 012, con la lógica de
 * 025): ids de colaboradores VERIFICADOS de la red del admin dueño cuyas categorías
 * declaradas intersectan las categorías de los recursos de la Actividad. El envío
 * del aviso lo hará 012 cuando se implemente; aquí se resuelve a quién.
 */
export async function listarDestinatariosConvocatoria(
  { afiliaciones }: Pick<AfiliacionDeps, "afiliaciones">,
  adminId: string,
  categoriasDeLaActividad: readonly CategoriaRecurso[],
): Promise<string[]> {
  if (categoriasDeLaActividad.length === 0) return [];
  return afiliaciones.listarDestinatarios(adminId, categoriasDeLaActividad);
}
