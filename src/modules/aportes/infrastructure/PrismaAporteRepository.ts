import { prisma } from "@/lib/prisma";
import type { Aporte, NuevoAporte } from "@/modules/aportes/domain/Aporte";
import type { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { EstadoAporte as Estados } from "@/modules/aportes/domain/EstadoAporte";
import type {
  AgregadoPorMeta,
  AportanteDeActividad,
  AporteRepository,
  FiltroAportes,
  RecolectadoPorRecursoId,
} from "@/modules/aportes/domain/AporteRepository";

// Incluye recurso y colaborador para las vistas (tabla admin, "mis aportes").
const INCLUDE_DETALLE = {
  recurso: true,
  colaborador: true,
  medioDonacion: true,
} as const;

type FilaAporte = {
  id: string;
  actividadId: string | null;
  recursoId: string;
  colaboradorId: string | null;
  cantidad: { toNumber: () => number };
  moneda: string | null;
  estado: EstadoAporte;
  nota: string | null;
  registradoPorId: string | null;
  medioDonacionId: string | null;
  referencia: string | null;
  recibidoEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
  recurso: { id: string; nombre: string; unidad: string } | null;
  colaborador: { id: string; nombre: string; email: string } | null;
  medioDonacion: { id: string; tipo: string; titular: string } | null;
};

function mapear(fila: FilaAporte): Aporte {
  return {
    id: fila.id,
    actividadId: fila.actividadId,
    recursoId: fila.recursoId,
    colaboradorId: fila.colaboradorId,
    cantidad: fila.cantidad.toNumber(),
    moneda: fila.moneda,
    estado: fila.estado,
    nota: fila.nota,
    registradoPorId: fila.registradoPorId,
    medioDonacionId: fila.medioDonacionId,
    referencia: fila.referencia,
    recibidoEn: fila.recibidoEn,
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
    recurso: fila.recurso
      ? {
          id: fila.recurso.id,
          nombre: fila.recurso.nombre,
          unidad: fila.recurso.unidad,
        }
      : null,
    colaborador: fila.colaborador
      ? {
          id: fila.colaborador.id,
          nombre: fila.colaborador.nombre,
          email: fila.colaborador.email,
        }
      : null,
    medio: fila.medioDonacion
      ? { id: fila.medioDonacion.id, tipo: fila.medioDonacion.tipo, titular: fila.medioDonacion.titular }
      : null,
  };
}

export class PrismaAporteRepository implements AporteRepository {
  async crear(datos: NuevoAporte): Promise<Aporte> {
    const fila = await prisma.aporte.create({
      data: {
        actividadId: datos.actividadId,
        recursoId: datos.recursoId,
        colaboradorId: datos.colaboradorId,
        cantidad: datos.cantidad,
        nota: datos.nota,
        moneda: datos.moneda ?? null,
        ...(datos.estado ? { estado: datos.estado } : {}),
        registradoPorId: datos.registradoPorId ?? null,
        medioDonacionId: datos.medioDonacionId ?? null,
        referencia: datos.referencia ?? null,
        ...(datos.recibidoEn !== undefined ? { recibidoEn: datos.recibidoEn } : {}),
      },
      include: INCLUDE_DETALLE,
    });
    return mapear(fila);
  }

  async buscarPorId(id: string): Promise<Aporte | null> {
    const fila = await prisma.aporte.findUnique({
      where: { id },
      include: INCLUDE_DETALLE,
    });
    return fila ? mapear(fila) : null;
  }

  async listarPorActividad(
    actividadId: string,
    filtro?: FiltroAportes,
  ): Promise<Aporte[]> {
    const filas = await prisma.aporte.findMany({
      where: {
        actividadId,
        ...(filtro?.estado ? { estado: filtro.estado } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: INCLUDE_DETALLE,
    });
    return filas.map(mapear);
  }

  async listarDeColaborador(colaboradorId: string): Promise<Aporte[]> {
    const filas = await prisma.aporte.findMany({
      where: { colaboradorId },
      orderBy: { createdAt: "desc" },
      include: INCLUDE_DETALLE,
    });
    return filas.map(mapear);
  }

  /**
   * Registro de reconocimiento (feature 023): `select` explícito solo con
   * `colaborador.nombre` (sin cédula/teléfono/correo) + recurso + cantidad +
   * estado + fecha, ordenado del más reciente al más antiguo.
   */
  async listarAportantesDeActividad(actividadId: string): Promise<AportanteDeActividad[]> {
    const filas = await prisma.aporte.findMany({
      where: { actividadId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        cantidad: true,
        estado: true,
        createdAt: true,
        colaborador: { select: { nombre: true } },
        recurso: { select: { nombre: true, unidad: true } },
      },
    });
    return filas.map((fila) => ({
      id: fila.id,
      aportanteNombre: fila.colaborador?.nombre ?? "Donación externa",
      recursoNombre: fila.recurso.nombre,
      recursoUnidad: fila.recurso.unidad,
      cantidad: fila.cantidad.toNumber(),
      estado: fila.estado,
      fecha: fila.createdAt,
    }));
  }

  /**
   * Idempotente: solo actualiza si el estado actual matchea `desde`, evitando
   * race conditions cuando dos administradores marcan a la vez. Si no matcheó,
   * devuelve `null`.
   */
  async cambiarEstado(
    id: string,
    desde: EstadoAporte,
    hacia: EstadoAporte,
  ): Promise<Aporte | null> {
    const recibidoEn = hacia === Estados.RECIBIDO ? new Date() : null;
    const resultado = await prisma.aporte.updateMany({
      where: { id, estado: desde },
      data: { estado: hacia, recibidoEn },
    });
    if (resultado.count === 0) return null;
    return this.buscarPorId(id);
  }

  async eliminar(id: string): Promise<void> {
    await prisma.aporte.delete({ where: { id } });
  }

  async listarRecientes(limit: number): Promise<Aporte[]> {
    const filas = await prisma.aporte.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.max(0, limit),
      include: INCLUDE_DETALLE,
    });
    return filas.map(mapear);
  }

  async listarIngresosExternos(): Promise<Aporte[]> {
    const filas = await prisma.aporte.findMany({
      where: { registradoPorId: { not: null } },
      orderBy: [{ recibidoEn: "desc" }, { createdAt: "desc" }],
      include: INCLUDE_DETALLE,
    });
    return filas.map(mapear);
  }

  /**
   * Agrega recibido/prometido por recurso para una Actividad usando `groupBy`. El
   * índice `(actividadId, recursoId, estado)` mantiene barata la consulta.
   */
  async progresoPorActividad(actividadId: string): Promise<AgregadoPorMeta[]> {
    const grupos = await prisma.aporte.groupBy({
      by: ["recursoId", "estado"],
      where: { actividadId },
      _sum: { cantidad: true },
    });

    const porRecurso = new Map<string, AgregadoPorMeta>();
    for (const g of grupos) {
      const actual = porRecurso.get(g.recursoId) ?? {
        recursoId: g.recursoId,
        recibido: 0,
        prometido: 0,
      };
      const suma = g._sum.cantidad?.toNumber() ?? 0;
      if (g.estado === Estados.RECIBIDO) actual.recibido += suma;
      else if (g.estado === Estados.COMPROMETIDO) actual.prometido += suma;
      porRecurso.set(g.recursoId, actual);
    }
    return [...porRecurso.values()];
  }

  async recolectadoGlobalPorRecurso(): Promise<RecolectadoPorRecursoId[]> {
    const grupos = await prisma.aporte.groupBy({
      by: ["recursoId"],
      where: { estado: Estados.RECIBIDO },
      _sum: { cantidad: true },
    });
    return grupos
      .map((g) => ({
        recursoId: g.recursoId,
        cantidadRecibida: g._sum.cantidad?.toNumber() ?? 0,
      }))
      .filter((fila) => fila.cantidadRecibida > 0);
  }

  async contar(filtro?: FiltroAportes): Promise<number> {
    return prisma.aporte.count({
      where: {
        ...(filtro?.estado ? { estado: filtro.estado } : {}),
        ...(filtro?.actividadId ? { actividadId: filtro.actividadId } : {}),
      },
    });
  }
}
