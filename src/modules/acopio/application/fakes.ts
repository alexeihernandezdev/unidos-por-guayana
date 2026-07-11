import type { LectorUbicacionAdmin } from "@/modules/acopio/domain/LectorUbicacionAdmin";
import type {
  CambiosPuntoAcopio,
  NuevoPuntoAcopio,
  PuntoAcopio,
} from "@/modules/acopio/domain/PuntoAcopio";
import type {
  FiltroPuntosAcopio,
  PuntoAcopioRepository,
} from "@/modules/acopio/domain/PuntoAcopioRepository";
import {
  NombrePuntoDuplicadoError,
  PuntoAcopioNoEncontradoError,
} from "./errors";

// Doble en memoria del repositorio de puntos. Replica la unicidad
// `@@unique([adminId, nombre])` para probar el error de duplicado sin base.
export class InMemoryPuntoAcopioRepository implements PuntoAcopioRepository {
  private readonly porId = new Map<string, PuntoAcopio>();
  private secuencia = 0;

  async crear(datos: NuevoPuntoAcopio): Promise<PuntoAcopio> {
    for (const punto of this.porId.values()) {
      if (punto.adminId === datos.adminId && punto.nombre === datos.nombre) {
        throw new NombrePuntoDuplicadoError(datos.nombre);
      }
    }
    const ahora = new Date();
    const punto: PuntoAcopio = {
      id: `punto-${++this.secuencia}`,
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
      activo: true,
      createdAt: ahora,
      updatedAt: ahora,
    };
    this.porId.set(punto.id, punto);
    return punto;
  }

  async listarPorAdmin(
    adminId: string,
    filtro?: FiltroPuntosAcopio,
  ): Promise<PuntoAcopio[]> {
    let puntos = [...this.porId.values()].filter((p) => p.adminId === adminId);
    if (filtro?.activo !== undefined) {
      puntos = puntos.filter((p) => p.activo === filtro.activo);
    }
    return puntos;
  }

  async buscarPorId(id: string): Promise<PuntoAcopio | null> {
    return this.porId.get(id) ?? null;
  }

  async actualizar(
    id: string,
    cambios: CambiosPuntoAcopio,
  ): Promise<PuntoAcopio> {
    const actual = this.porId.get(id);
    if (!actual) throw new PuntoAcopioNoEncontradoError(id);
    if (
      cambios.nombre !== undefined &&
      cambios.nombre !== actual.nombre
    ) {
      for (const punto of this.porId.values()) {
        if (
          punto.id !== id &&
          punto.adminId === actual.adminId &&
          punto.nombre === cambios.nombre
        ) {
          throw new NombrePuntoDuplicadoError(cambios.nombre);
        }
      }
    }
    const actualizado: PuntoAcopio = {
      ...actual,
      ...cambios,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return actualizado;
  }

  async cambiarActivo(id: string, activo: boolean): Promise<PuntoAcopio> {
    const actual = this.porId.get(id);
    if (!actual) throw new PuntoAcopioNoEncontradoError(id);
    const actualizado = { ...actual, activo, updatedAt: new Date() };
    this.porId.set(id, actualizado);
    return actualizado;
  }
}

// Doble en memoria del puerto que lee la ubicación del PerfilAdmin.
export class InMemoryLectorUbicacionAdmin implements LectorUbicacionAdmin {
  private readonly porAdmin = new Map<
    string,
    { estadoId: string; municipioId: string }
  >();

  registrar(
    adminId: string,
    ubicacion: { estadoId: string; municipioId: string },
  ): void {
    this.porAdmin.set(adminId, ubicacion);
  }

  async leerPorAdminId(
    adminId: string,
  ): Promise<{ estadoId: string; municipioId: string } | null> {
    return this.porAdmin.get(adminId) ?? null;
  }
}
