import type {
  StoragePort,
  UrlSubidaFirmada,
} from "@/modules/archivos/domain/StoragePort";

// Doble en memoria del `StoragePort` para los tests de casos de uso. Registra qué
// rutas se pidieron subir, leer y eliminar, sin tocar ningún proveedor real.
export class FakeStorage implements StoragePort {
  readonly subidas: string[] = [];
  readonly lecturas: string[] = [];
  readonly eliminados: string[] = [];

  async crearUrlSubidaFirmada(path: string): Promise<UrlSubidaFirmada> {
    this.subidas.push(path);
    return { url: `https://fake.storage/upload/${path}`, path };
  }

  async crearUrlLecturaFirmada(path: string): Promise<string> {
    this.lecturas.push(path);
    return `https://fake.storage/read/${path}`;
  }

  async eliminar(paths: string[]): Promise<void> {
    this.eliminados.push(...paths);
  }
}
