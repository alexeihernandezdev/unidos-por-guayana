import { contarActividadesPorEstado } from "@/modules/actividades/application/contarActividadesPorEstado";
import { listarEnviosPublicos } from "@/modules/actividades/application/listarEnviosPublicos";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import type { EstadoActividad as EstadoActividadType } from "@/modules/actividades/domain/EstadoActividad";
import { recolectadoPorRecurso } from "@/modules/aportes/application/recolectadoPorRecurso";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import type { AporteDeps } from "@/modules/aportes/application/deps";
import type { ActividadDeps } from "@/modules/actividades/application/deps";
import type { ArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import type { StoragePort } from "@/modules/archivos/domain/StoragePort";
import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";

export type TransparenciaDeps = Pick<ActividadDeps, "actividades"> &
  Pick<AporteDeps, "aportes" | "actividades" | "recursos"> & {
    // Almacenamiento público para resolver la portada de cada actividad (feature 033).
    storage: StoragePort;
  };

/**
 * URL pública de la imagen principal de una actividad, o `null` si no tiene o si el
 * almacenamiento no está disponible (degradación silenciosa para no romper la página
 * pública). Feature 033.
 */
export function portadaPublica(
  archivos: ArchivoActividad[],
  storage: StoragePort,
): string | null {
  const principal = archivos.find(
    (a) => a.tipo === TipoArchivoActividad.PRINCIPAL,
  );
  if (!principal) return null;
  try {
    return storage.urlPublica(principal.path);
  } catch {
    return null;
  }
}

export type TotalesImpactoPublico = {
  enviosTotal: number;
  enviosEntregados: number;
  aportesConfirmados: number;
};

export type RecolectadoRecursoResumen = {
  recurso: string;
  unidad: string;
  categoria: CategoriaRecurso;
  cantidadRecibida: number;
};

export type EnvioResumenPublico = {
  actividadId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  estado: EstadoActividadType;
  tipo: import("@/modules/actividades/domain/TipoActividad").TipoActividad;
  porcentaje: number;
  // URL pública de la imagen de portada, o `null` si no tiene (feature 033).
  portadaUrl: string | null;
};

export type ResumenPublico = {
  totales: TotalesImpactoPublico;
  recolectadoPorRecurso: RecolectadoRecursoResumen[];
  envios: EnvioResumenPublico[];
};

const CAMPOS_PERSONALES = [
  "colaboradorId",
  "solicitanteId",
  "email",
  "nombre",
  "cedula",
  "telefono",
  "passwordHash",
  "nota",
  "prometido",
] as const;

/** Aserción compartida: el DTO público no debe filtrar identidades. */
export function assertSinDatosPersonales(valor: unknown): void {
  const json = JSON.stringify(valor);
  for (const campo of CAMPOS_PERSONALES) {
    if (json.includes(`"${campo}"`)) {
      throw new Error(`DTO público contiene campo personal: ${campo}`);
    }
  }
}

/** Vista general del tablero público. Solo campos agregados y anónimos. */
export async function obtenerResumenPublico(
  deps: TransparenciaDeps,
): Promise<ResumenPublico> {
  const [conteos, recolectado, enviosConProgreso, aportesConfirmados] =
    await Promise.all([
      contarActividadesPorEstado(deps),
      recolectadoPorRecurso(deps),
      listarEnviosPublicos(deps),
      deps.aportes.contar({ estado: EstadoAporte.RECIBIDO }),
    ]);

  const enviosTotal = Object.values(conteos).reduce((acc, n) => acc + n, 0);

  const resumen: ResumenPublico = {
    totales: {
      enviosTotal,
      enviosEntregados: conteos[EstadoActividad.ENTREGADO],
      aportesConfirmados,
    },
    recolectadoPorRecurso: recolectado.map(
      ({ recurso, unidad, categoria, cantidadRecibida }) => ({
        recurso,
        unidad,
        categoria,
        cantidadRecibida,
      }),
    ),
    envios: enviosConProgreso.map(({ ayuda, porcentaje }) => ({
      actividadId: ayuda.id,
      titulo: ayuda.titulo,
      sectorDestino: ayuda.sectorDestino,
      fecha: ayuda.fecha,
      estado: ayuda.estado,
      tipo: ayuda.tipo,
      porcentaje,
      portadaUrl: portadaPublica(ayuda.archivos, deps.storage),
    })),
  };

  assertSinDatosPersonales(resumen);
  return resumen;
}
