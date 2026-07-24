import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TipoNotificacion } from "@/modules/notificaciones/domain/TipoNotificacion";
import { WhatsAppCloudAdapter } from "./WhatsAppCloudAdapter";

const ENV_KEYS = [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_API_VERSION",
  "WHATSAPP_LANG",
  "WHATSAPP_TEMPLATE_NUEVA_ACTIVIDAD",
  "WHATSAPP_TEMPLATE_META_CUMPLIDA",
] as const;

function limpiarEnv() {
  for (const k of ENV_KEYS) delete process.env[k];
}

describe("WhatsAppCloudAdapter", () => {
  beforeEach(() => {
    limpiarEnv();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    limpiarEnv();
    vi.unstubAllGlobals();
  });

  const envio = {
    telefonoE164: "+584121234567",
    tipo: TipoNotificacion.NUEVA_ACTIVIDAD,
    variables: ["Catia La Mar"],
  };

  it("es no-op si faltan las credenciales de Meta", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await new WhatsAppCloudAdapter().enviar(envio);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("omite el envío si no hay plantilla configurada para el tipo", async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = "tok";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";
    // Sin WHATSAPP_TEMPLATE_NUEVA_ACTIVIDAD.
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await new WhatsAppCloudAdapter().enviar(envio);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("hace la llamada a la Graph API con la plantilla y variables", async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = "tok";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";
    process.env.WHATSAPP_TEMPLATE_NUEVA_ACTIVIDAD = "nueva_actividad";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await new WhatsAppCloudAdapter().enviar(envio);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/123/messages");
    expect(init.headers.Authorization).toBe("Bearer tok");
    const cuerpo = JSON.parse(init.body);
    expect(cuerpo.to).toBe("584121234567"); // sin el "+"
    expect(cuerpo.template.name).toBe("nueva_actividad");
    expect(cuerpo.template.components[0].parameters).toEqual([
      { type: "text", text: "Catia La Mar" },
    ]);
  });

  it("lanza si la Graph API responde con error", async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = "tok";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123";
    process.env.WHATSAPP_TEMPLATE_NUEVA_ACTIVIDAD = "nueva_actividad";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "token vencido",
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(new WhatsAppCloudAdapter().enviar(envio)).rejects.toThrow(
      /401/,
    );
  });
});
