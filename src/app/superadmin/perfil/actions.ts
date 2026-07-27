"use server";

import { revalidatePath } from "next/cache";
import {
  DatosCuentaInvalidosError,
  EmailYaRegistradoError,
  PasswordActualIncorrectaError,
  UsuarioNoEncontradoError,
} from "@/modules/usuarios/application/errors";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  actualizarDatosCuentaServicio,
  cambiarPasswordServicio,
  requireRol,
} from "@/shared/auth";

const RUTA = "/superadmin/perfil";

type Resultado = { ok: true } | { ok: false; error: string };

/** El SUPERADMIN actualiza su nombre y correo (feature 035). */
export async function actualizarDatosCuentaAction(input: {
  nombre: string;
  email: string;
}): Promise<Resultado> {
  const sesion = await requireRol(Rol.SUPERADMIN);
  try {
    await actualizarDatosCuentaServicio(sesion.id, input);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (error) {
    if (
      error instanceof DatosCuentaInvalidosError ||
      error instanceof EmailYaRegistradoError
    ) {
      return { ok: false, error: error.message };
    }
    if (error instanceof UsuarioNoEncontradoError) {
      return { ok: false, error: "No pudimos encontrar tu cuenta." };
    }
    throw error;
  }
}

/** El SUPERADMIN cambia su contraseña (feature 035). */
export async function cambiarPasswordAction(input: {
  passwordActual: string;
  passwordNueva: string;
}): Promise<Resultado> {
  const sesion = await requireRol(Rol.SUPERADMIN);
  try {
    await cambiarPasswordServicio(sesion.id, input);
    return { ok: true };
  } catch (error) {
    if (
      error instanceof PasswordActualIncorrectaError ||
      error instanceof DatosCuentaInvalidosError
    ) {
      return { ok: false, error: error.message };
    }
    if (error instanceof UsuarioNoEncontradoError) {
      return { ok: false, error: "No pudimos encontrar tu cuenta." };
    }
    throw error;
  }
}
