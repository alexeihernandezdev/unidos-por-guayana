import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { CATEGORIAS_RECURSO } from "@/modules/recursos/domain/CategoriaRecurso";
import type { EstadoVerificacion } from "@/modules/usuarios/domain/Rol";
import type {
  Afiliacion,
  CentroDisponible,
  MiembroRed,
} from "@/modules/afiliaciones/domain/Afiliacion";
import type {
  AfiliacionRepository,
  ConteoPorCategoria,
} from "@/modules/afiliaciones/domain/AfiliacionRepository";
import type {
  FiltroCentros,
  LectorCentrosDisponibles,
} from "@/modules/afiliaciones/domain/LectorCentrosDisponibles";
import { intersectanCategorias } from "@/modules/afiliaciones/domain/reglas";

// Datos de un colaborador que la red necesita conocer (categorías, verificación,
// contacto). En producción salen del `Usuario`; aquí se registran a mano.
export type ColaboradorInfo = {
  nombre: string;
  categorias: CategoriaRecurso[];
  estadoVerificacion: EstadoVerificacion;
  telefono: string | null;
  telefonoEsWhatsApp: boolean;
};

// Doble en memoria del repositorio de afiliaciones. Guarda los vínculos y un
// registro de la info de cada colaborador para computar red/conteo/destinatarios.
export class InMemoryAfiliacionRepository implements AfiliacionRepository {
  private readonly vinculos = new Map<string, Afiliacion>();
  private readonly colaboradores = new Map<string, ColaboradorInfo>();
  private secuencia = 0;

  private clave(colaboradorId: string, adminId: string): string {
    return `${colaboradorId}|${adminId}`;
  }

  registrarColaborador(id: string, info: ColaboradorInfo): void {
    this.colaboradores.set(id, info);
  }

  async afiliar(colaboradorId: string, adminId: string): Promise<Afiliacion> {
    const clave = this.clave(colaboradorId, adminId);
    const existente = this.vinculos.get(clave);
    if (existente) return existente;
    const afiliacion: Afiliacion = {
      id: `afiliacion-${++this.secuencia}`,
      colaboradorId,
      adminId,
      createdAt: new Date(),
    };
    this.vinculos.set(clave, afiliacion);
    return afiliacion;
  }

  async remover(colaboradorId: string, adminId: string): Promise<void> {
    this.vinculos.delete(this.clave(colaboradorId, adminId));
  }

  async buscar(
    colaboradorId: string,
    adminId: string,
  ): Promise<Afiliacion | null> {
    return this.vinculos.get(this.clave(colaboradorId, adminId)) ?? null;
  }

  async listarAdminIdsDeColaborador(colaboradorId: string): Promise<string[]> {
    return [...this.vinculos.values()]
      .filter((a) => a.colaboradorId === colaboradorId)
      .map((a) => a.adminId);
  }

  private miembrosDe(adminId: string): MiembroRed[] {
    return [...this.vinculos.values()]
      .filter((a) => a.adminId === adminId)
      .map((a) => {
        const info = this.colaboradores.get(a.colaboradorId);
        return {
          colaboradorId: a.colaboradorId,
          nombre: info?.nombre ?? a.colaboradorId,
          categorias: info?.categorias ?? [],
          estadoVerificacion: info?.estadoVerificacion ?? "PENDIENTE",
          telefono: info?.telefono ?? null,
          telefonoEsWhatsApp: info?.telefonoEsWhatsApp ?? false,
          afiliadoEn: a.createdAt,
        } satisfies MiembroRed;
      });
  }

  async listarRed(
    adminId: string,
    filtroCategoria?: CategoriaRecurso,
  ): Promise<MiembroRed[]> {
    const miembros = this.miembrosDe(adminId);
    if (!filtroCategoria) return miembros;
    return miembros.filter((m) => m.categorias.includes(filtroCategoria));
  }

  async contarAptosPorCategoria(adminId: string): Promise<ConteoPorCategoria> {
    const conteo = CATEGORIAS_RECURSO.reduce((acc, c) => {
      acc[c] = 0;
      return acc;
    }, {} as ConteoPorCategoria);
    for (const miembro of this.miembrosDe(adminId)) {
      if (miembro.estadoVerificacion !== "VERIFICADO") continue;
      for (const categoria of miembro.categorias) {
        conteo[categoria]++;
      }
    }
    return conteo;
  }

  async listarDestinatarios(
    adminId: string,
    categorias: readonly CategoriaRecurso[],
  ): Promise<string[]> {
    return this.miembrosDe(adminId)
      .filter(
        (m) =>
          m.estadoVerificacion === "VERIFICADO" &&
          intersectanCategorias(m.categorias, categorias),
      )
      .map((m) => m.colaboradorId);
  }
}

// Doble en memoria del lector de centros disponibles.
export class InMemoryLectorCentrosDisponibles
  implements LectorCentrosDisponibles
{
  constructor(private readonly centros: CentroDisponible[] = []) {}

  async listar(filtro?: FiltroCentros): Promise<CentroDisponible[]> {
    return this.centros.filter((c) => {
      if (filtro?.estadoId && c.estadoId !== filtro.estadoId) return false;
      if (filtro?.municipioId && c.municipioId !== filtro.municipioId) {
        return false;
      }
      return true;
    });
  }
}
