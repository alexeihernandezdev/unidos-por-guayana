"use server";

import { revalidatePath } from "next/cache";
import {
  CuentaAuditorInvalidaError,
  EmailYaRegistradoError,
  SoloSuperadminError,
  UsuarioNoEncontradoError,
} from "@/modules/usuarios/application/errors";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  crearAuditorGestion,
  reactivarAuditorGestion,
  requireRol,
  suspenderAuditorGestion,
} from "@/shared/auth";
import type { CrearAuditorEstado } from "@/modules/usuarios/ui/GestionAuditores";
import { liberarAsignacionesAuditorServicio } from "@/shared/auditoria";

const RUTA = "/superadmin/auditores";

export async function crearAuditorAction(
  _estado: CrearAuditorEstado,
  formData: FormData,
): Promise<CrearAuditorEstado> {
  const actor = await requireRol(Rol.SUPERADMIN);
  const nombre = formData.get("nombre");
  const email = formData.get("email");
  const password = formData.get("password");
  if (
    typeof nombre !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { ok: false, mensaje: "Completa todos los campos." };
  }

  try {
    await crearAuditorGestion(
      { rol: actor.rol },
      { nombre, email, password },
    );
    revalidatePath(RUTA);
    return { ok: true, mensaje: "Cuenta auditora creada y activa." };
  } catch (error) {
    if (error instanceof EmailYaRegistradoError) {
      return { ok: false, mensaje: "Ya existe una cuenta con ese email." };
    }
    if (error instanceof CuentaAuditorInvalidaError) {
      return { ok: false, mensaje: error.message };
    }
    throw error;
  }
}

async function cambiarEstado(
  formData: FormData,
  accion: "suspender" | "reactivar",
): Promise<void> {
  const actor = await requireRol(Rol.SUPERADMIN);
  const auditorId = formData.get("auditorId");
  if (typeof auditorId !== "string" || !auditorId) return;
  try {
    if (accion === "suspender") {
      await suspenderAuditorGestion({ rol: actor.rol }, auditorId);
      await liberarAsignacionesAuditorServicio(auditorId, actor.id);
    } else {
      await reactivarAuditorGestion({ rol: actor.rol }, auditorId);
    }
    revalidatePath(RUTA);
  } catch (error) {
    if (
      error instanceof CuentaAuditorInvalidaError ||
      error instanceof UsuarioNoEncontradoError ||
      error instanceof SoloSuperadminError
    ) {
      return;
    }
    throw error;
  }
}

export async function suspenderAuditorAction(formData: FormData): Promise<void> {
  await cambiarEstado(formData, "suspender");
}

export async function reactivarAuditorAction(formData: FormData): Promise<void> {
  await cambiarEstado(formData, "reactivar");
}
