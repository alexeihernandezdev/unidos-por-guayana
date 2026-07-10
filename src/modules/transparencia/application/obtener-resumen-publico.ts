import { contarAyudasPorEstado } from "@/modules/ayudas/application/contarAyudasPorEstado";
import { listarEnviosPublicos } from "@/modules/ayudas/application/listarEnviosPublicos";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import type { EstadoAyuda as EstadoAyudaType } from "@/modules/ayudas/domain/EstadoAyuda";
import { recolectadoPorRecurso } from "@/modules/aportes/application/recolectadoPorRecurso";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import type { AporteDeps } from "@/modules/aportes/application/deps";
import type { AyudaDeps } from "@/modules/ayudas/application/deps";
import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";

export type TransparenciaDeps = Pick<AyudaDeps, "ayudas"> &
  Pick<AporteDeps, "aportes" | "ayudas" | "recursos">;

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
  ayudaId: string;
  titulo: string;
  sectorDestino: string;
  fecha: Date;
  estado: EstadoAyudaType;
  tipo: import("@/modules/ayudas/domain/TipoActividad").TipoActividad;
  porcentaje: number;
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
      contarAyudasPorEstado(deps),
      recolectadoPorRecurso(deps),
      listarEnviosPublicos(deps),
      deps.aportes.contar({ estado: EstadoAporte.RECIBIDO }),
    ]);

  const enviosTotal = Object.values(conteos).reduce((acc, n) => acc + n, 0);

  const resumen: ResumenPublico = {
    totales: {
      enviosTotal,
      enviosEntregados: conteos[EstadoAyuda.ENTREGADO],
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
      ayudaId: ayuda.id,
      titulo: ayuda.titulo,
      sectorDestino: ayuda.sectorDestino,
      fecha: ayuda.fecha,
      estado: ayuda.estado,
      tipo: ayuda.tipo,
      porcentaje,
    })),
  };

  assertSinDatosPersonales(resumen);
  return resumen;
}
