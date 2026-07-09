"use server";

import { z } from "zod";
import {
  EmailYaRegistradoError,
  RolNoAutoRegistrableError,
} from "@/modules/usuarios/application/errors";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { registrarNuevoUsuario } from "@/shared/auth";

// Validación en el límite (servidor): el rol solo puede ser auto-registrable.
// La regla también se aplica en el caso de uso; aquí se rechaza antes de tocar
// la base y se dan mensajes claros.
const RegistroSchema = z.object({
  nombre: z.string().trim().min(2, "Indica tu nombre.").max(80),
  email: z.email("Introduce un email válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(100),
  rol: z.enum([Rol.COLABORADOR, Rol.SOLICITANTE]),
});

export async function registrarUsuarioAction(input: {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = RegistroSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await registrarNuevoUsuario(parsed.data);
    return { ok: true };
  } catch (error) {
    if (error instanceof EmailYaRegistradoError) {
      return { ok: false, error: "Ya existe una cuenta con ese email." };
    }
    if (error instanceof RolNoAutoRegistrableError) {
      return { ok: false, error: "Ese rol no está permitido en el registro." };
    }
    throw error;
  }
}
