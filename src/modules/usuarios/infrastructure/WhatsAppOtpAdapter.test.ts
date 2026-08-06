import { afterEach, describe, expect, it, vi } from "vitest";
import {
  WhatsAppOtpAdapter,
  WhatsAppOtpNoConfiguradoError,
} from "./WhatsAppOtpAdapter";

const CLAVES = [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_TEMPLATE_LOGIN_OTP",
  "WHATSAPP_API_VERSION",
  "WHATSAPP_LANG",
] as const;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  for (const clave of CLAVES) delete process.env[clave];
});

describe("WhatsAppOtpAdapter", () => {
  it("falla explícitamente cuando el canal no está configurado", async () => {
    await expect(
      new WhatsAppOtpAdapter().enviar({
        telefonoE164: "+584121234567",
        codigo: "012345",
      }),
    ).rejects.toBeInstanceOf(WhatsAppOtpNoConfiguradoError);
  });

  it("envía cuerpo y botón de la plantilla de autenticación", async () => {
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "token");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "phone-id");
    vi.stubEnv("WHATSAPP_TEMPLATE_LOGIN_OTP", "login_otp");
    vi.stubEnv("WHATSAPP_API_VERSION", "v21.0");
    vi.stubEnv("WHATSAPP_LANG", "es");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await new WhatsAppOtpAdapter().enviar({
      telefonoE164: "+584121234567",
      codigo: "012345",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body));
    expect(body.to).toBe("584121234567");
    expect(body.template.name).toBe("login_otp");
    expect(body.template.components[0].parameters[0].text).toBe("012345");
    expect(body.template.components[1].parameters[0].text).toBe("012345");
  });
});

