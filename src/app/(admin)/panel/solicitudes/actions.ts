"use server";

import { revalidatePath } from "next/cache";
import {
  SolicitudNoEncontradaError,
  TransicionInvalidaError,
} from "@/modules/solicitudes/application/errors";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  cerrarSolicitudServicio,
  marcarAtendidaServicio,
} from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";

const RUTA_LISTADO = "/panel/solicitudes";

export async function marcarAtendidaAction(formData: FormData): Promise<void> {
  await requireRol(Rol.ADMIN);
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  try {
    await marcarAtendidaServicio(id);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${id}`);
  } catch (error) {
    if (
      error instanceof TransicionInvalidaError ||
      error instanceof SolicitudNoEncontradaError
    ) {
      return;
    }
    throw error;
  }
}

export async function cerrarSolicitudAction(formData: FormData): Promise<void> {
  await requireRol(Rol.ADMIN);
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  try {
    await cerrarSolicitudServicio(id);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${id}`);
  } catch (error) {
    if (
      error instanceof TransicionInvalidaError ||
      error instanceof SolicitudNoEncontradaError
    ) {
      return;
    }
    throw error;
  }
}
