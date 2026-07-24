import type { TipoNotificacion } from "./TipoNotificacion";

// Mensaje a enviar por WhatsApp (feature 012). El texto real lo define la plantilla
// aprobada en Meta; aquí solo se pasan el `tipo` (elige la plantilla por env), el
// destino en E.164 y las variables posicionales que rellenan la plantilla.
export type EnvioWhatsApp = {
  telefonoE164: string;
  tipo: TipoNotificacion;
  variables: readonly string[];
};

/**
 * Puerto del canal WhatsApp (feature 012). La implementación concreta
 * (`WhatsAppCloudAdapter`) llama a la Graph API de Meta. Es **plug-n-play**: si
 * faltan las credenciales de entorno, el adaptador es no-op. Best-effort: un fallo
 * de envío no debe propagarse a la operación de negocio.
 */
export interface CanalWhatsApp {
  enviar(mensaje: EnvioWhatsApp): Promise<void>;
}
