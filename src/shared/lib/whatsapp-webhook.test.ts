import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  challengeWebhookWhatsapp,
  firmaWebhookWhatsappValida,
} from "./whatsapp-webhook";

describe("challengeWebhookWhatsapp", () => {
  it("devuelve el challenge cuando modo y token son válidos", () => {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": "token-secreto",
      "hub.challenge": "123456",
    });

    expect(challengeWebhookWhatsapp(params, "token-secreto")).toBe("123456");
  });

  it.each([
    ["modo distinto", "publish", "token-secreto", "123456"],
    ["token distinto", "subscribe", "otro-token", "123456"],
    ["challenge ausente", "subscribe", "token-secreto", null],
  ])("rechaza %s", (_caso, modo, token, challenge) => {
    const params = new URLSearchParams({
      "hub.mode": modo,
      "hub.verify_token": token,
    });
    if (challenge !== null) params.set("hub.challenge", challenge);

    expect(challengeWebhookWhatsapp(params, "token-secreto")).toBeNull();
  });
});

describe("firmaWebhookWhatsappValida", () => {
  const cuerpo = '{"object":"whatsapp_business_account"}';
  const appSecret = "app-secret";

  it("acepta el HMAC-SHA256 del cuerpo exacto", () => {
    const firma = `sha256=${createHmac("sha256", appSecret)
      .update(cuerpo, "utf8")
      .digest("hex")}`;

    expect(firmaWebhookWhatsappValida(cuerpo, firma, appSecret)).toBe(true);
  });

  it.each([
    ["firma ausente", null],
    ["prefijo incorrecto", `sha1=${"a".repeat(64)}`],
    ["hex mal formado", `sha256=${"z".repeat(64)}`],
    ["longitud incorrecta", "sha256=abcd"],
    ["firma incorrecta", `sha256=${"0".repeat(64)}`],
  ])("rechaza %s sin lanzar", (_caso, firma) => {
    expect(firmaWebhookWhatsappValida(cuerpo, firma, appSecret)).toBe(false);
  });

  it("rechaza si el cuerpo fue modificado después de firmarse", () => {
    const firma = `sha256=${createHmac("sha256", appSecret)
      .update(cuerpo, "utf8")
      .digest("hex")}`;

    expect(
      firmaWebhookWhatsappValida(`${cuerpo} `, firma, appSecret),
    ).toBe(false);
  });
});

