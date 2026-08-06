"use server";

import { z } from "zod";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  UsuarioNoEncontradoError,
} from "@/modules/usuarios/application/errors";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import { normalizarTelefono } from "@/modules/usuarios/domain/datosContacto";
import {
  actualizarDatosContactoUsuario,
  buscarUsuarioPorId,
  requireSesion,
} from "@/shared/auth";
import {
  DestinoVerificacionTelefono,
  iniciarVerificacionTelefonoServicio,
  telefonoPendienteServicio,
} from "@/shared/verificacion-telefono";

// Validación en el límite (formato mínimo). Las reglas completas viven en el
// dominio (`validarDatosContacto`), que consume el caso de uso.
const DatosContactoSchema = z.object({
  cedula: z.string().trim().min(1, "La cédula es obligatoria.").max(20),
  telefono: z.string().trim().min(1, "El teléfono es obligatorio.").max(20),
  telefonoEsWhatsApp: z.literal(true, {
    message: "El teléfono debe tener WhatsApp para poder verificarlo.",
  }),
  estadoId: z.string().trim().min(1, "Selecciona el estado.").max(40),
  municipioId: z.string().trim().min(1, "Selecciona el municipio.").max(40),
});

type Resultado = { ok: true } | { ok: false; error: string };

export async function guardarDatosContactoAction(
  input: DatosContacto,
): Promise<Resultado> {
  const usuario = await requireSesion();

  const parsed = DatosContactoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    const actual = await buscarUsuarioPorId(usuario.id);
    if (!actual) {
      return { ok: false, error: "No pudimos encontrar tu cuenta." };
    }
    const telefonoNuevo =
      normalizarTelefono(parsed.data.telefono) ?? parsed.data.telefono;
    const telefonoCambio = actual.telefono !== telefonoNuevo;
    await actualizarDatosContactoUsuario(usuario.id, {
      ...parsed.data,
      telefono: actual.telefono ?? parsed.data.telefono,
      telefonoEsWhatsApp:
        actual.telefono === null
          ? true
          : actual.telefonoEsWhatsApp,
    });
    if (telefonoCambio) {
      try {
        await iniciarVerificacionTelefonoServicio(
          usuario.id,
          DestinoVerificacionTelefono.USUARIO,
          telefonoNuevo,
        );
      } catch {
        const solicitudCreada = await telefonoPendienteServicio(usuario.id);
        if (!solicitudCreada && actual.telefono) {
          return {
            ok: false,
            error:
              "No pudimos iniciar la verificación. Tu teléfono anterior se conserva.",
          };
        }
      }
    }
    return { ok: true };
  } catch (error) {
    if (error instanceof DatosContactoInvalidosError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof CedulaYaRegistradaError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof UsuarioNoEncontradoError) {
      return { ok: false, error: "No pudimos encontrar tu cuenta." };
    }
    throw error;
  }
}
