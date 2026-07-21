import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  StoragePort,
  UrlSubidaFirmada,
} from "@/modules/archivos/domain/StoragePort";

// Adaptador de almacenamiento sobre Supabase Storage (feature 031). Usa la clave
// `service_role`, que SOLO puede vivir en el servidor: este módulo nunca se importa
// desde la presentación (ESLint hace cumplir el límite de capas). El cliente jamás
// ve la clave; sube mediante URLs firmadas de un solo uso emitidas aquí.

type ConfigSupabase = { url: string; key: string; bucket: string };

function leerConfig(): ConfigSupabase {
  // La URL no es secreta: se acepta también la que Supabase entrega como
  // `NEXT_PUBLIC_SUPABASE_URL`. La clave, en cambio, es la SECRETA (service_role /
  // secret key) y solo se lee de `SUPABASE_SERVICE_ROLE_KEY`, nunca de una var pública.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!url || !key || !bucket) {
    throw new Error(
      "Supabase Storage no está configurado. Define SUPABASE_URL (o " +
        "NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY y " +
        "SUPABASE_STORAGE_BUCKET en el entorno.",
    );
  }
  return { url, key, bucket };
}

export class SupabaseStorageAdapter implements StoragePort {
  private memo: {
    supabase: SupabaseClient;
    bucket: string;
  } | null = null;

  // Cliente perezoso: no se instancia (ni exige config) hasta el primer uso, para
  // que el resto de la app funcione en local sin las variables de Supabase.
  private cliente() {
    if (!this.memo) {
      const { url, key, bucket } = leerConfig();
      const supabase = createClient(url, key, {
        auth: { persistSession: false },
      });
      this.memo = { supabase, bucket };
    }
    return this.memo;
  }

  // La firma del puerto recibe `contentType`, pero Supabase no lo necesita para crear
  // la URL de subida (el cliente lo envía en el PUT), así que la implementación lo omite.
  async crearUrlSubidaFirmada(path: string): Promise<UrlSubidaFirmada> {
    const { supabase, bucket } = this.cliente();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);
    if (error || !data) {
      throw new Error(
        `No se pudo preparar la subida del archivo: ${error?.message ?? "error desconocido"}.`,
      );
    }
    // `data.signedUrl` ya es una URL absoluta y de un solo uso (incluye
    // https://<ref>.supabase.co/storage/v1/object/upload/sign/...?token=...). El
    // navegador hace PUT directo con el binario como cuerpo.
    return { url: data.signedUrl, path: data.path ?? path };
  }

  async crearUrlLecturaFirmada(
    path: string,
    expiraSegundos: number,
  ): Promise<string> {
    const { supabase, bucket } = this.cliente();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiraSegundos);
    if (error || !data) {
      throw new Error(
        `No se pudo generar el enlace del archivo: ${error?.message ?? "error desconocido"}.`,
      );
    }
    return data.signedUrl;
  }

  async eliminar(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { supabase, bucket } = this.cliente();
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      throw new Error(`No se pudieron eliminar los archivos: ${error.message}.`);
    }
  }
}
