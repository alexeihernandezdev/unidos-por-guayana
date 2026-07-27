import type {
  CanalWhatsApp,
  EnvioWhatsApp,
} from "@/modules/notificaciones/domain/CanalWhatsApp";
import { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";

// Configuración leída del entorno (solo servidor). El token es secreto; nunca se
// expone al cliente. Se lee en cada envío para que sea plug-n-play: colocar las
// variables activa el canal sin reiniciar ni tocar código.
type ConfigWhatsApp = {
  token: string;
  phoneNumberId: string;
  apiVersion: string;
  lang: string;
};

function leerConfig(): ConfigWhatsApp | null {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return null;
  return {
    token,
    phoneNumberId,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
    lang: process.env.WHATSAPP_LANG || "es",
  };
}

// Nombre de la plantilla aprobada en Meta para cada tipo (configurable por env).
function nombrePlantilla(tipo: TipoNotificacion): string | undefined {
  const nombres: Record<TipoNotificacion, string | undefined> = {
    [TipoNotificacion.NUEVA_ACTIVIDAD]:
      process.env.WHATSAPP_TEMPLATE_NUEVA_ACTIVIDAD,
    [TipoNotificacion.META_CUMPLIDA]:
      process.env.WHATSAPP_TEMPLATE_META_CUMPLIDA,
    [TipoNotificacion.NUEVO_APORTE]:
      process.env.WHATSAPP_TEMPLATE_NUEVO_APORTE,
    [TipoNotificacion.ESTADO_APORTE]:
      process.env.WHATSAPP_TEMPLATE_ESTADO_APORTE,
    [TipoNotificacion.NUEVA_AFILIACION]:
      process.env.WHATSAPP_TEMPLATE_NUEVA_AFILIACION,
    [TipoNotificacion.AFILIACION_REMOVIDA]:
      process.env.WHATSAPP_TEMPLATE_AFILIACION_REMOVIDA,
    [TipoNotificacion.NUEVA_SOLICITUD_ZONA]:
      process.env.WHATSAPP_TEMPLATE_NUEVA_SOLICITUD_ZONA,
    [TipoNotificacion.ESTADO_SOLICITUD]:
      process.env.WHATSAPP_TEMPLATE_ESTADO_SOLICITUD,
    [TipoNotificacion.ACTUALIZACION_AUDITORIA]:
      process.env.WHATSAPP_TEMPLATE_ACTUALIZACION_AUDITORIA,
    [TipoNotificacion.NUEVA_SOLICITUD_AUDITABLE]:
      process.env.WHATSAPP_TEMPLATE_NUEVA_SOLICITUD_AUDITABLE,
    [TipoNotificacion.RESULTADO_PROPUESTA_RECURSO]:
      process.env.WHATSAPP_TEMPLATE_RESULTADO_PROPUESTA_RECURSO,
    [TipoNotificacion.RESULTADO_TESTIMONIO]:
      process.env.WHATSAPP_TEMPLATE_RESULTADO_TESTIMONIO,
    [TipoNotificacion.NUEVO_ADMIN_PENDIENTE]:
      process.env.WHATSAPP_TEMPLATE_NUEVO_ADMIN_PENDIENTE,
    [TipoNotificacion.ESTADO_CUENTA_ADMIN]:
      process.env.WHATSAPP_TEMPLATE_ESTADO_CUENTA_ADMIN,
  };
  return nombres[tipo];
}

/**
 * Adaptador de WhatsApp Cloud API (Meta), feature 012. Plug-n-play:
 * - Sin `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` es **no-op** (no lanza).
 * - Si no hay plantilla configurada para el `tipo`, omite ese envío.
 * - Envía un mensaje `type: template` con variables posicionales en el `body`.
 * Best-effort: ante un error HTTP lo registra y lanza, para que el emisor (que usa
 * `Promise.allSettled`) lo trate como "intentado" sin romper el negocio.
 */
export class WhatsAppCloudAdapter implements CanalWhatsApp {
  async enviar(mensaje: EnvioWhatsApp): Promise<void> {
    const config = leerConfig();
    if (!config) return; // Meta no configurado: no-op.

    const plantilla = nombrePlantilla(mensaje.tipo);
    if (!plantilla) return; // Sin plantilla para este tipo: se omite.

    // Meta espera el número en dígitos con código de país, sin el `+`.
    const to = mensaje.telefonoE164.replace(/\D/g, "");

    const body = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: plantilla,
        language: { code: config.lang },
        components:
          mensaje.variables.length > 0
            ? [
                {
                  type: "body",
                  parameters: mensaje.variables.map((text) => ({
                    type: "text",
                    text,
                  })),
                },
              ]
            : [],
      },
    };

    const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      throw new Error(
        `WhatsApp Cloud API respondió ${res.status}: ${detalle.slice(0, 300)}`,
      );
    }
  }
}
