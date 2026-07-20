import { prisma } from "@/lib/prisma";
import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import type {
  AtencionInfo,
  NecesidadInfo,
  NecesidadPendiente,
} from "@/modules/atenciones/domain/Atencion";
import type { AtencionRepository } from "@/modules/atenciones/domain/AtencionRepository";

// Un recurso es seleccionable (usable como meta) solo si está `APROBADO` y `activo`.
function esSeleccionable(recurso: {
  estadoAprobacion: string;
  activo: boolean;
}): boolean {
  return recurso.estadoAprobacion === "APROBADO" && recurso.activo;
}

// Convierte el `Decimal?` de Prisma a `number | null` (el dominio usa números puros).
function aNumero(valor: { toNumber: () => number } | null): number | null {
  return valor ? valor.toNumber() : null;
}

// Implementación del contrato de atenciones sobre Prisma (feature 030).
export class PrismaAtencionRepository implements AtencionRepository {
  async listarNecesidadesPendientes(): Promise<NecesidadPendiente[]> {
    const filas = await prisma.recursoSolicitud.findMany({
      where: {
        atencion: { is: null },
        solicitud: { estado: "ABIERTA" },
      },
      include: {
        recurso: true,
        solicitud: { include: { solicitante: true } },
      },
      // Más urgentes primero (el enum se ordena por su definición: BAJA, MEDIA, ALTA),
      // y dentro de cada urgencia, las solicitudes más antiguas antes.
      orderBy: [
        { solicitud: { urgencia: "desc" } },
        { solicitud: { createdAt: "asc" } },
      ],
    });

    return filas.map((fila) => ({
      recursoSolicitudId: fila.id,
      solicitudId: fila.solicitudId,
      sector: fila.solicitud.sector,
      urgencia: fila.solicitud.urgencia as UrgenciaSolicitud,
      solicitanteNombre: fila.solicitud.solicitante.nombre,
      cantidadEstimada: aNumero(fila.cantidadEstimada),
      recurso: {
        id: fila.recurso.id,
        nombre: fila.recurso.nombre,
        unidad: fila.recurso.unidad,
        categoria: fila.recurso.categoria as CategoriaRecurso,
        seleccionable: esSeleccionable(fila.recurso),
      },
    }));
  }

  async buscarNecesidad(
    recursoSolicitudId: string,
  ): Promise<NecesidadInfo | null> {
    const fila = await prisma.recursoSolicitud.findUnique({
      where: { id: recursoSolicitudId },
      include: { recurso: true, solicitud: true, atencion: true },
    });
    if (!fila) return null;

    return {
      recursoSolicitudId: fila.id,
      recursoId: fila.recursoId,
      cantidadEstimada: aNumero(fila.cantidadEstimada),
      solicitudAbierta: fila.solicitud.estado === "ABIERTA",
      yaAtendida: fila.atencion !== null,
      recursoSeleccionable: esSeleccionable(fila.recurso),
      recursoNombre: fila.recurso.nombre,
    };
  }

  async buscarAtencion(atencionId: string): Promise<AtencionInfo | null> {
    const fila = await prisma.atencionNecesidad.findUnique({
      where: { id: atencionId },
      include: { metaRecurso: true },
    });
    if (!fila) return null;

    return {
      atencionId: fila.id,
      actividadId: fila.metaRecurso.actividadId,
    };
  }

  async vincular(datos: {
    recursoSolicitudId: string;
    actividadId: string;
    recursoId: string;
    cantidadObjetivo: number;
  }): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // find-or-create de la meta: si ya existe, no se toca la cantidad.
      const meta = await tx.metaRecurso.upsert({
        where: {
          actividadId_recursoId: {
            actividadId: datos.actividadId,
            recursoId: datos.recursoId,
          },
        },
        create: {
          actividadId: datos.actividadId,
          recursoId: datos.recursoId,
          cantidadObjetivo: datos.cantidadObjetivo,
        },
        update: {},
      });
      // La unicidad de `recursoSolicitudId` hace fallar el segundo intento si otra
      // actividad tomó la necesidad primero (carrera).
      await tx.atencionNecesidad.create({
        data: {
          recursoSolicitudId: datos.recursoSolicitudId,
          metaRecursoId: meta.id,
        },
      });
    });
  }

  async desvincular(atencionId: string): Promise<void> {
    await prisma.atencionNecesidad.delete({ where: { id: atencionId } });
  }
}
