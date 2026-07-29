import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/webhooks/whatsapp", () => {
  it("devuelve literalmente el challenge de Meta", async () => {
    vi.stubEnv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "token-secreto");
    const request = new Request(
      "https://ejemplo.org/api/webhooks/whatsapp?" +
        new URLSearchParams({
          "hub.mode": "subscribe",
          "hub.verify_token": "token-secreto",
          "hub.challenge": "987654",
        }),
    );

    const response = GET(request);

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("987654");
  });

  it("rechaza un token incorrecto", () => {
    vi.stubEnv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "token-secreto");
    const request = new Request(
      "https://ejemplo.org/api/webhooks/whatsapp?" +
        new URLSearchParams({
          "hub.mode": "subscribe",
          "hub.verify_token": "token-incorrecto",
          "hub.challenge": "987654",
        }),
    );

    expect(GET(request).status).toBe(403);
  });

  it("rechaza la verificación cuando falta configuración", () => {
    vi.stubEnv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "");
    const request = new Request(
      "https://ejemplo.org/api/webhooks/whatsapp?hub.mode=subscribe",
    );

    expect(GET(request).status).toBe(403);
  });
});

describe("POST /api/webhooks/whatsapp", () => {
  const cuerpo = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [],
  });

  it("acepta un evento firmado sin procesar su contenido", async () => {
    const appSecret = "app-secret";
    vi.stubEnv("META_APP_SECRET", appSecret);
    const firma = `sha256=${createHmac("sha256", appSecret)
      .update(cuerpo, "utf8")
      .digest("hex")}`;
    const request = new Request(
      "https://ejemplo.org/api/webhooks/whatsapp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hub-Signature-256": firma,
        },
        body: cuerpo,
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("EVENT_RECEIVED");
  });

  it("rechaza un evento sin firma", async () => {
    vi.stubEnv("META_APP_SECRET", "app-secret");
    const request = new Request(
      "https://ejemplo.org/api/webhooks/whatsapp",
      {
        method: "POST",
        body: cuerpo,
      },
    );

    await expect(POST(request)).resolves.toMatchObject({ status: 401 });
  });

  it("responde 503 cuando falta el App Secret", async () => {
    vi.stubEnv("META_APP_SECRET", "");
    const request = new Request(
      "https://ejemplo.org/api/webhooks/whatsapp",
      {
        method: "POST",
        body: cuerpo,
      },
    );

    await expect(POST(request)).resolves.toMatchObject({ status: 503 });
  });
});

