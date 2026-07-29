import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

const PREFIJO_FIRMA = "sha256=";
const FIRMA_SHA256_HEX = /^[a-fA-F0-9]{64}$/;

function compararSecreto(valor: string, esperado: string): boolean {
  const valorHash = createHash("sha256").update(valor, "utf8").digest();
  const esperadoHash = createHash("sha256").update(esperado, "utf8").digest();
  return timingSafeEqual(valorHash, esperadoHash);
}

/**
 * Devuelve el challenge solo cuando la solicitud de verificación de Meta es
 * válida. El verify token es un secreto propio de la aplicación, no el access
 * token de WhatsApp.
 */
export function challengeWebhookWhatsapp(
  params: URLSearchParams,
  verifyToken: string,
): string | null {
  const modo = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (
    modo !== "subscribe" ||
    token === null ||
    challenge === null ||
    !compararSecreto(token, verifyToken)
  ) {
    return null;
  }

  return challenge;
}

/**
 * Valida la firma que Meta calcula sobre el cuerpo HTTP exacto. El cuerpo debe
 * permanecer como texto hasta completar esta comprobación.
 */
export function firmaWebhookWhatsappValida(
  cuerpo: string,
  firma: string | null,
  appSecret: string,
): boolean {
  if (!firma?.startsWith(PREFIJO_FIRMA)) return false;

  const firmaHex = firma.slice(PREFIJO_FIRMA.length);
  if (!FIRMA_SHA256_HEX.test(firmaHex)) return false;

  const firmaRecibida = Buffer.from(firmaHex, "hex");
  const firmaEsperada = createHmac("sha256", appSecret)
    .update(cuerpo, "utf8")
    .digest();

  return (
    firmaRecibida.length === firmaEsperada.length &&
    timingSafeEqual(firmaRecibida, firmaEsperada)
  );
}

