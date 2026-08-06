"use server";

import { redirect } from "next/navigation";
import { requireSesion } from "@/shared/auth";
import {
  cancelarVerificacionTelefonoServicio,
  confirmarVerificacionTelefonoServicio,
  iniciarVerificacionActualTelefonoServicio,
  reenviarVerificacionTelefonoServicio,
  VerificacionTelefonoError,
} from "@/shared/verificacion-telefono";

type Resultado = { ok: true } | { ok: false; error: string };

function errorVisible(error: unknown): Resultado {
  if (error instanceof VerificacionTelefonoError) {
    return { ok: false, error: error.message };
  }
  return {
    ok: false,
    error: "No pudimos completar la operación. Intenta nuevamente.",
  };
}

export async function enviarCodigoAction(): Promise<Resultado> {
  const usuario = await requireSesion();
  try {
    await iniciarVerificacionActualTelefonoServicio(usuario.id);
    return { ok: true };
  } catch (error) {
    return errorVisible(error);
  }
}

export async function reenviarCodigoAction(): Promise<Resultado> {
  const usuario = await requireSesion();
  try {
    await reenviarVerificacionTelefonoServicio(usuario.id);
    return { ok: true };
  } catch (error) {
    return errorVisible(error);
  }
}

export async function confirmarCodigoAction(
  codigo: string,
): Promise<Resultado> {
  const usuario = await requireSesion();
  try {
    await confirmarVerificacionTelefonoServicio(usuario.id, codigo);
  } catch (error) {
    return errorVisible(error);
  }
  redirect("/inicio");
}

export async function cancelarCambioAction(): Promise<Resultado> {
  const usuario = await requireSesion();
  try {
    await cancelarVerificacionTelefonoServicio(usuario.id);
  } catch (error) {
    return errorVisible(error);
  }
  redirect("/inicio");
}

