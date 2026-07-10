"use server";

import { revalidatePath } from "next/cache";
import {
  CuentaAdminNoAprobableError,
  SoloSuperadminError,
  UsuarioNoEncontradoError,
} from "@/modules/usuarios/application/errors";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  aprobarAdminGestion,
  rechazarAdminGestion,
  requireRol,
} from "@/shared/auth";

const RUTA_BANDEJA = "/superadmin/admins";

// Errores esperados de dominio/aplicación: si saltan (la cuenta ya se resolvió,
// dejó de ser ADMIN, o desapareció), se ignoran y la próxima navegación refresca
// la bandeja con el estado real. Cualquier otro error se propaga.
function esErrorEsperado(error: unknown): boolean {
  return (
    error instanceof SoloSuperadminError ||
    error instanceof UsuarioNoEncontradoError ||
    error instanceof CuentaAdminNoAprobableError
  );
}

export async function aprobarAdminAction(formData: FormData): Promise<void> {
  const sesion = await requireRol(Rol.SUPERADMIN);
  const adminId = formData.get("adminId");
  if (typeof adminId !== "string" || !adminId) return;

  try {
    await aprobarAdminGestion({ rol: sesion.rol }, adminId);
  } catch (error) {
    if (!esErrorEsperado(error)) throw error;
  }
  revalidatePath(RUTA_BANDEJA);
}

export async function rechazarAdminAction(formData: FormData): Promise<void> {
  const sesion = await requireRol(Rol.SUPERADMIN);
  const adminId = formData.get("adminId");
  if (typeof adminId !== "string" || !adminId) return;

  try {
    await rechazarAdminGestion({ rol: sesion.rol }, adminId);
  } catch (error) {
    if (!esErrorEsperado(error)) throw error;
  }
  revalidatePath(RUTA_BANDEJA);
}
