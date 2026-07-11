import { prisma } from "@/lib/prisma";
import type {
  CambiosPuntoAcopio,
  NuevoPuntoAcopio,
  PuntoAcopio,
} from "@/modules/acopio/domain/PuntoAcopio";
import type {
  FiltroPuntosAcopio,
  PuntoAcopioRepository,
} from "@/modules/acopio/domain/PuntoAcopioRepository";

// La fila de Prisma trae `latitud`/`longitud` como `Decimal`; la entidad de
// dominio los expone como `string` (número serializado, sin ceros a la derecha)
// para no arrastrar el tipo `Decimal` de Prisma fuera de la infra. Cualquier
// consumo numérico se hace donde importe (mapa Leaflet en la UI).
type FilaPuntoAcopio = Omit<PuntoAcopio, "latitud" | "longitud"> & {
  latitud: { toString(): string };
  longitud: { toString(): string };
};

function aDominio(fila: FilaPuntoAcopio): PuntoAcopio {
  return {
    ...fila,
    latitud: fila.latitud.toString(),
    longitud: fila.longitud.toString(),
  };
}

// Implementación del repositorio sobre Prisma. Todas las consultas filtran por
// `adminId` en el nivel de repo — no hay `listarTodos`: la propiedad la garantiza
// esta capa además del caso de uso.
export class PrismaPuntoAcopioRepository implements PuntoAcopioRepository {
  async crear(datos: NuevoPuntoAcopio): Promise<PuntoAcopio> {
    const fila = await prisma.puntoAcopio.create({
      data: {
        adminId: datos.adminId,
        nombre: datos.nombre,
        referencia: datos.referencia,
        latitud: datos.latitud,
        longitud: datos.longitud,
        horarios: datos.horarios,
        telefono: datos.telefono,
        telefonoEsWhatsApp: datos.telefonoEsWhatsApp,
        correo: datos.correo,
        estadoId: datos.estadoId,
        municipioId: datos.municipioId,
      },
    });
    return aDominio(fila);
  }

  async listarPorAdmin(
    adminId: string,
    filtro?: FiltroPuntosAcopio,
  ): Promise<PuntoAcopio[]> {
    const where: { adminId: string; activo?: boolean } = { adminId };
    if (filtro?.activo !== undefined) where.activo = filtro.activo;
    const filas = await prisma.puntoAcopio.findMany({
      where,
      orderBy: { nombre: "asc" },
    });
    return filas.map(aDominio);
  }

  async buscarPorId(id: string): Promise<PuntoAcopio | null> {
    const fila = await prisma.puntoAcopio.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async actualizar(
    id: string,
    cambios: CambiosPuntoAcopio,
  ): Promise<PuntoAcopio> {
    const fila = await prisma.puntoAcopio.update({
      where: { id },
      data: cambios,
    });
    return aDominio(fila);
  }

  async cambiarActivo(id: string, activo: boolean): Promise<PuntoAcopio> {
    const fila = await prisma.puntoAcopio.update({
      where: { id },
      data: { activo },
    });
    return aDominio(fila);
  }
}
