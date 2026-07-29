import {
  challengeWebhookWhatsapp,
  firmaWebhookWhatsappValida,
} from "@/shared/lib/whatsapp-webhook";

export const runtime = "nodejs";

export function GET(request: Request): Response {
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!verifyToken) {
    return new Response("Webhook no configurado", { status: 403 });
  }

  const challenge = challengeWebhookWhatsapp(
    new URL(request.url).searchParams,
    verifyToken,
  );

  if (challenge === null) {
    return new Response("Verificación rechazada", { status: 403 });
  }

  return new Response(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return new Response("Webhook no configurado", { status: 503 });
  }

  let cuerpo: string;
  try {
    cuerpo = await request.text();
  } catch {
    return new Response("Cuerpo inválido", { status: 400 });
  }

  const firma = request.headers.get("x-hub-signature-256");
  if (!firmaWebhookWhatsappValida(cuerpo, firma, appSecret)) {
    return new Response("Firma inválida", { status: 401 });
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}

