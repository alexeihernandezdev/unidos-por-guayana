import {
  type CategoriaRecurso,
  CATEGORIAS_RECURSO,
} from "@/modules/recursos/domain/CategoriaRecurso";
import { EstadoVerificacion } from "@/modules/usuarios/domain/Rol";
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

// Miembro de la red mostrado al crear/editar una Actividad (feature 026), recortado
// para no exponer datos de contacto fuera de `/panel/red`: solo nombre, categorías
// declaradas y si está verificado.
export type MiembroRedApto = {
  colaboradorId: string;
  nombre: string;
  categorias: CategoriaRecurso[];
  verificado: boolean;
};

// Red del ADMIN agrupada por categoría: un miembro aparece bajo cada categoría que
// declaró. Alimenta el botón "+ info" que lista a los aptos por recurso.
export type RedAptaPorCategoria = Record<CategoriaRecurso, MiembroRedApto[]>;

/**
 * Red apta del ADMIN agrupada por categoría (feature 026). Reutiliza `listarRed`
 * (toda la red, verificados y no) y coloca a cada miembro bajo cada categoría que
 * declaró, mapeando al DTO recortado sin contacto. El conteo del encabezado sigue
 * contando solo verificados (`contarAptosPorCategoria`); esta lista incluye a los
 * pendientes, diferenciados por `verificado`.
 */
export async function listarRedAptaPorCategoria(
  { afiliaciones }: Pick<AfiliacionDeps, "afiliaciones">,
  adminId: string,
): Promise<RedAptaPorCategoria> {
  const red = await afiliaciones.listarRed(adminId);
  const agrupado = Object.fromEntries(
    CATEGORIAS_RECURSO.map((categoria) => [categoria, [] as MiembroRedApto[]]),
  ) as RedAptaPorCategoria;

  for (const miembro of red) {
    const apto: MiembroRedApto = {
      colaboradorId: miembro.colaboradorId,
      nombre: miembro.nombre,
      categorias: miembro.categorias,
      verificado: miembro.estadoVerificacion === EstadoVerificacion.VERIFICADO,
    };
    for (const categoria of miembro.categorias) {
      agrupado[categoria].push(apto);
    }
  }

  return agrupado;
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
