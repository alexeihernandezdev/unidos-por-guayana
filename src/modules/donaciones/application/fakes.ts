import type {
  CambiosMedioDonacion,
  MedioDonacion,
  NuevoMedioDonacion,
} from "@/modules/donaciones/domain/MedioDonacion";
import type { MedioDonacionRepository } from "@/modules/donaciones/domain/MedioDonacionRepository";

// Doble en memoria para los tests de casos de uso de donaciones. No toca la base
// ni Prisma.
export class InMemoryMedioDonacionRepository
  implements MedioDonacionRepository
{
  private readonly porId = new Map<string, MedioDonacion>();
  private secuencia = 0;

  async crear(datos: NuevoMedioDonacion): Promise<MedioDonacion> {
    const ahora = new Date();
    const medio: MedioDonacion = {
      id: `medio-${++this.secuencia}`,
      tipo: datos.tipo,
      titular: datos.titular,
      moneda: datos.moneda,
      datos: datos.datos,
      nota: datos.nota,
      orden: datos.orden ?? 0,
      activo: true,
      createdAt: ahora,
      updatedAt: ahora,
    };
    this.porId.set(medio.id, medio);
    return { ...medio };
  }

  async buscarPorId(id: string): Promise<MedioDonacion | null> {
    const medio = this.porId.get(id);
    return medio ? { ...medio } : null;
  }

  async listar(): Promise<MedioDonacion[]> {
    return [...this.porId.values()]
      .sort(this.porOrden)
      .map((m) => ({ ...m }));
  }

  async listarPublicables(): Promise<MedioDonacion[]> {
    return [...this.porId.values()]
      .filter((m) => m.activo)
      .sort(this.porOrden)
      .map((m) => ({ ...m }));
  }

  async actualizar(
    id: string,
    cambios: CambiosMedioDonacion,
  ): Promise<MedioDonacion> {
    const actual = this.porId.get(id);
    if (!actual) throw new Error(`Medio ${id} no existe`);
    const actualizado: MedioDonacion = {
      ...actual,
      ...cambios,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return { ...actualizado };
  }

  async cambiarActivo(id: string, activo: boolean): Promise<MedioDonacion> {
    return this.actualizar(id, { activo });
  }

  private porOrden(a: MedioDonacion, b: MedioDonacion): number {
    if (a.orden !== b.orden) return a.orden - b.orden;
    return a.createdAt.getTime() - b.createdAt.getTime();
  }
}
