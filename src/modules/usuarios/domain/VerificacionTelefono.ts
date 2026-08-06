import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const DestinoVerificacionTelefono = {
  USUARIO: "USUARIO",
  PERFIL_ADMIN: "PERFIL_ADMIN",
} as const;

export type DestinoVerificacionTelefono =
  (typeof DestinoVerificacionTelefono)[keyof typeof DestinoVerificacionTelefono];

export const OTP_DIGITOS = 6;
export const OTP_VIGENCIA_MINUTOS = 10;
export const OTP_MAX_INTENTOS = 5;
export const OTP_REENVIO_SEGUNDOS = 60;
export const OTP_MAX_ENVIOS_HORA = 5;

export function generarCodigoOtp(): string {
  return randomInt(0, 10 ** OTP_DIGITOS)
    .toString()
    .padStart(OTP_DIGITOS, "0");
}

export function hashCodigoOtp(
  solicitudId: string,
  codigo: string,
  secreto: string,
): string {
  return createHmac("sha256", secreto)
    .update(`${solicitudId}:${codigo}`, "utf8")
    .digest("hex");
}

export function codigoOtpCoincide(
  solicitudId: string,
  codigo: string,
  hashEsperado: string,
  secreto: string,
): boolean {
  const recibido = Buffer.from(
    hashCodigoOtp(solicitudId, codigo, secreto),
    "hex",
  );
  const esperado = Buffer.from(hashEsperado, "hex");
  return (
    recibido.length === esperado.length && timingSafeEqual(recibido, esperado)
  );
}

export function enmascararTelefono(telefono: string): string {
  const digitos = telefono.replace(/\D/g, "");
  const visibles = digitos.slice(-4);
  return `+${digitos.slice(0, Math.min(2, Math.max(0, digitos.length - 4)))} ••• ••${visibles}`;
}

