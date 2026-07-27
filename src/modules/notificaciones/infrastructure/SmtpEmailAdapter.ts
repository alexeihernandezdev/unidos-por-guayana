import nodemailer from "nodemailer";
import type {
  CanalEmail,
  EnvioEmail,
} from "@/modules/notificaciones/domain/CanalEmail";

type ConfigSmtp = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

function leerConfig(): ConfigSmtp | null {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim();
  const fromName = process.env.SMTP_FROM_NAME?.trim();
  if (
    !host ||
    !Number.isInteger(port) ||
    port <= 0 ||
    !user ||
    !password ||
    !fromEmail ||
    !fromName
  ) {
    return null;
  }
  return {
    host,
    port,
    secure: process.env.SMTP_SECURE?.toLowerCase() === "true",
    user,
    password,
    fromEmail,
    fromName,
  };
}

export function escaparHtml(valor: string): string {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function urlAbsoluta(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function htmlDeEnvio(envio: EnvioEmail): string {
  const nombre = escaparHtml(envio.nombre);
  const mensaje = escaparHtml(envio.mensaje);
  const href = escaparHtml(urlAbsoluta(envio.href));
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f5f2ea;color:#172d33;font-family:Arial,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dce3df;border-radius:12px;overflow:hidden">
          <tr><td style="background:#173f46;color:#ffffff;padding:24px 28px;font-size:20px;font-weight:700">Unidos por Guayana</td></tr>
          <tr><td style="padding:28px">
            <p style="margin:0 0 16px">Hola, ${nombre}.</p>
            <p style="margin:0 0 24px;line-height:1.6">${mensaje}</p>
            <a href="${href}" style="display:inline-block;background:#176f75;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Ver en la plataforma</a>
            <p style="margin:28px 0 0;color:#66767a;font-size:13px;line-height:1.5">Este correo fue enviado automáticamente. Puedes cambiar tus preferencias desde Ajustes.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function textoDeEnvio(envio: EnvioEmail): string {
  return [
    `Hola, ${envio.nombre}.`,
    "",
    envio.mensaje,
    "",
    `Ver en la plataforma: ${urlAbsoluta(envio.href)}`,
    "",
    "Este correo fue enviado automáticamente. Puedes cambiar tus preferencias desde Ajustes.",
  ].join("\n");
}

export class SmtpEmailAdapter implements CanalEmail {
  disponible(): boolean {
    return leerConfig() !== null;
  }

  async enviar(envio: EnvioEmail): Promise<void> {
    const config = leerConfig();
    if (!config) return;
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
    });
    await transport.sendMail({
      from: { name: config.fromName, address: config.fromEmail },
      to: { name: envio.nombre, address: envio.email },
      subject: envio.asunto,
      text: textoDeEnvio(envio),
      html: htmlDeEnvio(envio),
    });
  }

  async enviarPrueba(destinatario: {
    email: string;
    nombre: string;
  }): Promise<void> {
    if (!this.disponible()) {
      throw new Error("El servicio SMTP todavía no está configurado.");
    }
    await this.enviar({
      ...destinatario,
      tipo: "NUEVA_ACTIVIDAD",
      asunto: "Correo de prueba de Unidos por Guayana",
      mensaje:
        "La configuración SMTP funciona correctamente y este correo puede recibir notificaciones.",
      href: "/ajustes",
    });
  }
}
