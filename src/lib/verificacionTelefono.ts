import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { normalizarTelefono } from "@/modules/usuarios/domain/datosContacto";
import type { DestinoVerificacionTelefono as Destino } from "@/modules/usuarios/domain/VerificacionTelefono";
import {
  codigoOtpCoincide,
  enmascararTelefono,
  generarCodigoOtp,
  hashCodigoOtp,
  OTP_MAX_ENVIOS_HORA,
  OTP_MAX_INTENTOS,
  OTP_REENVIO_SEGUNDOS,
  OTP_VIGENCIA_MINUTOS,
} from "@/modules/usuarios/domain/VerificacionTelefono";
import { WhatsAppOtpAdapter } from "@/modules/usuarios/infrastructure/WhatsAppOtpAdapter";

const canal = new WhatsAppOtpAdapter();

export class VerificacionTelefonoError extends Error {
  constructor(
    message: string,
    readonly codigo:
      | "CONFIGURACION"
      | "NO_ENCONTRADA"
      | "CODIGO_INVALIDO"
      | "EXPIRADA"
      | "INTENTOS"
      | "REENVIO"
      | "LIMITE"
      | "NO_CANCELABLE",
  ) {
    super(message);
    this.name = "VerificacionTelefonoError";
  }
}

/**
 * El OTP telefónico es PLUG-N-PLAY, como el resto de canales de WhatsApp del
 * proyecto: permanece APAGADO mientras no exista `PHONE_OTP_SECRET`. Se llavea
 * sobre este secreto (variable propia de la feature 038, ausente hasta que Meta
 * esté verificado y la plantilla aprobada) para que el despliegue no bloquee ni
 * rompa ninguna funcionalidad: sin él, no se exige verificar el teléfono. Al
 * definirlo, la verificación se activa sola.
 */
export function otpTelefonoHabilitado(): boolean {
  return Boolean(process.env.PHONE_OTP_SECRET);
}

function secreto(): string {
  const valor = process.env.PHONE_OTP_SECRET;
  if (!valor) {
    throw new VerificacionTelefonoError(
      "La verificación telefónica no está configurada.",
      "CONFIGURACION",
    );
  }
  return valor;
}

async function crearSolicitud(
  usuarioId: string,
  destino: Destino,
  telefonoEntrada: string,
) {
  const telefono = normalizarTelefono(telefonoEntrada);
  if (!telefono) {
    throw new VerificacionTelefonoError(
      "El número de teléfono no es válido.",
      "NO_ENCONTRADA",
    );
  }

  const ahora = new Date();
  const desde = new Date(ahora.getTime() - 60 * 60 * 1000);
  const enviosRecientes = await prisma.verificacionTelefono.count({
    where: {
      usuarioId,
      telefonoPendiente: telefono,
      createdAt: { gte: desde },
    },
  });
  if (enviosRecientes >= OTP_MAX_ENVIOS_HORA) {
    throw new VerificacionTelefonoError(
      "Alcanzaste el límite de códigos. Intenta nuevamente dentro de una hora.",
      "LIMITE",
    );
  }

  const id = randomUUID();
  const codigo = generarCodigoOtp();
  const codigoHash = hashCodigoOtp(id, codigo, secreto());
  const expiraEn = new Date(
    ahora.getTime() + OTP_VIGENCIA_MINUTOS * 60 * 1000,
  );

  const solicitud = await prisma.$transaction(async (tx) => {
    await tx.verificacionTelefono.updateMany({
      where: { usuarioId, destino, consumidoEn: null },
      data: { consumidoEn: ahora },
    });
    return tx.verificacionTelefono.create({
      data: {
        id,
        usuarioId,
        destino,
        telefonoPendiente: telefono,
        codigoHash,
        expiraEn,
        ultimoEnvioEn: ahora,
      },
    });
  });

  try {
    await canal.enviar({ telefonoE164: telefono, codigo });
  } catch (error) {
    // Un código que Meta no confirmó como enviado no debe quedar aceptable.
    await prisma.verificacionTelefono.update({
      where: { id: solicitud.id },
      data: { consumidoEn: new Date() },
    });
    throw error;
  }
  return solicitud;
}

export async function iniciarVerificacionTelefonoServicio(
  usuarioId: string,
  destino: Destino,
  telefono: string,
): Promise<void> {
  await crearSolicitud(usuarioId, destino, telefono);
}

export async function iniciarVerificacionActualTelefonoServicio(
  usuarioId: string,
): Promise<void> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { perfilAdmin: true },
  });
  if (!usuario) {
    throw new VerificacionTelefonoError(
      "No pudimos encontrar tu cuenta.",
      "NO_ENCONTRADA",
    );
  }
  if (usuario.rol === "ADMIN" && usuario.perfilAdmin?.telefono) {
    await crearSolicitud(
      usuarioId,
      "PERFIL_ADMIN",
      usuario.perfilAdmin.telefono,
    );
    return;
  }
  if (usuario.telefono) {
    await crearSolicitud(usuarioId, "USUARIO", usuario.telefono);
    return;
  }
  throw new VerificacionTelefonoError(
    "Tu cuenta no tiene un teléfono para verificar.",
    "NO_ENCONTRADA",
  );
}

export async function reenviarVerificacionTelefonoServicio(
  usuarioId: string,
): Promise<void> {
  const actual = await prisma.verificacionTelefono.findFirst({
    where: { usuarioId, consumidoEn: null },
    orderBy: { createdAt: "desc" },
  });
  if (!actual) {
    throw new VerificacionTelefonoError(
      "No hay una verificación pendiente.",
      "NO_ENCONTRADA",
    );
  }
  const faltan =
    OTP_REENVIO_SEGUNDOS * 1000 - (Date.now() - actual.ultimoEnvioEn.getTime());
  if (faltan > 0) {
    throw new VerificacionTelefonoError(
      `Podrás solicitar otro código en ${Math.ceil(faltan / 1000)} segundos.`,
      "REENVIO",
    );
  }
  await crearSolicitud(usuarioId, actual.destino, actual.telefonoPendiente);
}

export async function confirmarVerificacionTelefonoServicio(
  usuarioId: string,
  codigo: string,
): Promise<void> {
  const solicitud = await prisma.verificacionTelefono.findFirst({
    where: { usuarioId, consumidoEn: null },
    orderBy: { createdAt: "desc" },
  });
  if (!solicitud) {
    throw new VerificacionTelefonoError(
      "No hay una verificación pendiente.",
      "NO_ENCONTRADA",
    );
  }
  const ahora = new Date();
  if (solicitud.expiraEn <= ahora) {
    await prisma.verificacionTelefono.update({
      where: { id: solicitud.id },
      data: { consumidoEn: ahora },
    });
    throw new VerificacionTelefonoError(
      "El código venció. Solicita uno nuevo.",
      "EXPIRADA",
    );
  }
  if (solicitud.intentosFallidos >= OTP_MAX_INTENTOS) {
    throw new VerificacionTelefonoError(
      "Este código alcanzó el máximo de intentos.",
      "INTENTOS",
    );
  }

  const valido =
    /^\d{6}$/.test(codigo) &&
    codigoOtpCoincide(
      solicitud.id,
      codigo,
      solicitud.codigoHash,
      secreto(),
    );
  if (!valido) {
    const intentos = solicitud.intentosFallidos + 1;
    await prisma.verificacionTelefono.update({
      where: { id: solicitud.id },
      data: {
        intentosFallidos: { increment: 1 },
        consumidoEn: intentos >= OTP_MAX_INTENTOS ? ahora : undefined,
      },
    });
    const restantes = Math.max(0, OTP_MAX_INTENTOS - intentos);
    throw new VerificacionTelefonoError(
      restantes > 0
        ? `Código incorrecto. Te quedan ${restantes} intentos.`
        : "Este código alcanzó el máximo de intentos.",
      restantes > 0 ? "CODIGO_INVALIDO" : "INTENTOS",
    );
  }

  await prisma.$transaction(async (tx) => {
    if (solicitud.destino === "PERFIL_ADMIN") {
      await tx.perfilAdmin.update({
        where: { usuarioId },
        data: {
          telefono: solicitud.telefonoPendiente,
          telefonoEsWhatsApp: true,
          telefonoVerificadoEn: ahora,
        },
      });
    } else {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          telefono: solicitud.telefonoPendiente,
          telefonoEsWhatsApp: true,
          telefonoVerificadoEn: ahora,
        },
      });
    }
    await tx.verificacionTelefono.updateMany({
      where: { usuarioId, consumidoEn: null },
      data: { consumidoEn: ahora },
    });
  });
}

export async function cancelarVerificacionTelefonoServicio(
  usuarioId: string,
): Promise<void> {
  const solicitud = await prisma.verificacionTelefono.findFirst({
    where: { usuarioId, consumidoEn: null },
    orderBy: { createdAt: "desc" },
  });
  if (!solicitud) return;

  const destino =
    solicitud.destino === "PERFIL_ADMIN"
      ? await prisma.perfilAdmin.findUnique({ where: { usuarioId } })
      : await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!destino?.telefono || !destino.telefonoVerificadoEn) {
    throw new VerificacionTelefonoError(
      "Debes verificar el teléfono para continuar.",
      "NO_CANCELABLE",
    );
  }
  await prisma.verificacionTelefono.update({
    where: { id: solicitud.id },
    data: { consumidoEn: new Date() },
  });
}

export async function estadoVerificacionTelefonoServicio(usuarioId: string) {
  const solicitud = await prisma.verificacionTelefono.findFirst({
    where: { usuarioId, consumidoEn: null },
    orderBy: { createdAt: "desc" },
  });
  if (!solicitud) return null;

  const destino =
    solicitud.destino === "PERFIL_ADMIN"
      ? await prisma.perfilAdmin.findUnique({ where: { usuarioId } })
      : await prisma.usuario.findUnique({ where: { id: usuarioId } });

  return {
    telefonoEnmascarado: enmascararTelefono(solicitud.telefonoPendiente),
    expiraEn: solicitud.expiraEn,
    reenvioEn: new Date(
      solicitud.ultimoEnvioEn.getTime() + OTP_REENVIO_SEGUNDOS * 1000,
    ),
    intentosRestantes: Math.max(
      0,
      OTP_MAX_INTENTOS - solicitud.intentosFallidos,
    ),
    cancelable: Boolean(destino?.telefono && destino.telefonoVerificadoEn),
  };
}

export async function telefonoPendienteServicio(
  usuarioId: string,
): Promise<boolean> {
  // Kill-switch por configuración: con el OTP apagado nunca hay teléfono
  // "pendiente", así que ningún gate redirige a /verificar-telefono.
  if (!otpTelefonoHabilitado()) return false;
  const [solicitud, usuario] = await Promise.all([
    prisma.verificacionTelefono.findFirst({
      where: { usuarioId, consumidoEn: null },
      select: { id: true },
    }),
    prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfilAdmin: true },
    }),
  ]);
  if (solicitud) return true;
  if (!usuario) return false;
  if (usuario.rol === "ADMIN") {
    return Boolean(
      usuario.perfilAdmin?.telefono &&
        !usuario.perfilAdmin.telefonoVerificadoEn,
    );
  }
  return Boolean(usuario.telefono && !usuario.telefonoVerificadoEn);
}
