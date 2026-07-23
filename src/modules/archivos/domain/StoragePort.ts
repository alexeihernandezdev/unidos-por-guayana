// Puerto de almacenamiento de objetos (feature 031). Contrato PURO del dominio: no
// conoce Supabase ni ningún proveedor concreto. La infraestructura lo implementa. El
// binario nunca pasa por el servidor de la app: se sube directo del navegador al
// proveedor mediante una URL firmada de subida, y se lee mediante URLs firmadas de
// lectura de corta vida (bucket privado).

/**
 * Datos para que el cliente suba un archivo directamente al proveedor.
 * `url` es absoluta y de un solo uso; el cliente hace `PUT` con el binario como cuerpo.
 * `path` es la ruta del objeto en el bucket, que la app persiste tras confirmar la subida.
 */
export type UrlSubidaFirmada = {
  url: string;
  path: string;
};

export interface StoragePort {
  /** Crea una URL firmada para subir un objeto a `path` con el `contentType` dado. */
  crearUrlSubidaFirmada(
    path: string,
    contentType: string,
  ): Promise<UrlSubidaFirmada>;

  /** Crea una URL firmada de lectura para `path`, válida `expiraSegundos`. */
  crearUrlLecturaFirmada(path: string, expiraSegundos: number): Promise<string>;

  /**
   * URL pública y permanente de lectura para `path` (feature 033). Solo tiene sentido
   * en un bucket público; se usa para servir las imágenes de actividades en la
   * transparencia sin sesión (cacheable, sin firmar). No hace red: es una construcción
   * determinista de la URL a partir del `path`.
   */
  urlPublica(path: string): string;

  /** Borra los objetos indicados por sus `paths`. No falla si la lista está vacía. */
  eliminar(paths: string[]): Promise<void>;
}
