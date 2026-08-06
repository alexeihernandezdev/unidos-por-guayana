import type {
  CanalOtpTelefono,
  MensajeOtpTelefono,
} from "@/modules/usuarios/domain/CanalOtpTelefono";

type ConfigOtp = {
  token: string;
  phoneNumberId: string;
  apiVersion: string;
  lang: string;
  template: string;
};

function leerConfig(): ConfigOtp | null {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.WHATSAPP_TEMPLATE_LOGIN_OTP;
  if (!token || !phoneNumberId || !template) return null;
  return {
    token,
    phoneNumberId,
    template,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
    lang: process.env.WHATSAPP_LANG || "es",
  };
}

export class WhatsAppOtpNoConfiguradoError extends Error {
  constructor() {
    super("El envío de códigos por WhatsApp no está configurado.");
    this.name = "WhatsAppOtpNoConfiguradoError";
  }
}

export class WhatsAppOtpAdapter implements CanalOtpTelefono {
  async enviar(mensaje: MensajeOtpTelefono): Promise<void> {
    const config = leerConfig();
    if (!config) throw new WhatsAppOtpNoConfiguradoError();

    const codigo = mensaje.codigo;
    const body = {
      messaging_product: "whatsapp",
      to: mensaje.telefonoE164.replace(/\D/g, ""),
      type: "template",
      template: {
        name: config.template,
        language: { code: config.lang },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: codigo }],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: codigo }],
          },
        ],
      },
    };

    const response = await fetch(
      `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const detalle = await response.text().catch(() => "");
      throw new Error(
        `WhatsApp Cloud API respondió ${response.status}: ${detalle.slice(0, 180)}`,
      );
    }
  }
}

