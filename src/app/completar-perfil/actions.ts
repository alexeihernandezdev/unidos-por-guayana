"use server";

import { z } from "zod";
import {
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  UsuarioNoEncontradoError,
} from "@/modules/usuarios/application/errors";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import {
  actualizarDatosContactoUsuario,
  requireSesion,
} from "@/shared/auth";

// Validación en el límite (formato mínimo). Las reglas completas viven en el
// dominio (`validarDatosContacto`), que consume el caso de uso.
const DatosContactoSchema = z.object({
  cedula: z.string().trim().min(1, "La cédula es obligatoria.").max(20),
  telefono: z.string().trim().min(1, "El teléfono es obligatorio.").max(20),
  telefonoEsWhatsApp: z.boolean(),
  estadoId: z.string().trim().min(1, "Indica el estado."),
  municipioId: z.string().trim().min(1, "Indica el municipio."),
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
    await actualizarDatosContactoUsuario(usuario.id, parsed.data);
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
