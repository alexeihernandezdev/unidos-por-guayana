"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  marcarLeidaServicio,
  marcarTodasLeidasServicio,
  NoAutorizadoError,
} from "@/shared/notificaciones";
import { requireSesion } from "@/shared/auth";

// Server actions de la bandeja y la campana (feature 012). Sesión requerida; el
// caso de uso valida además que la notificación sea del propio usuario. Se revalida
// `/notificaciones` (bandeja) y el layout para que el contador de la campana baje.
type Resultado = { ok: true } | { ok: false; error: string };

const IdSchema = z.string().min(1);

export async function marcarLeidaAction(id: string): Promise<Resultado> {
  const usuario = await requireSesion();
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Notificación no válida." };

  try {
    await marcarLeidaServicio(parsed.data, usuario.id);
    revalidatePath("/notificaciones");
    return { ok: true };
  } catch (error) {
    if (error instanceof NoAutorizadoError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

export async function marcarTodasLeidasAction(): Promise<Resultado> {
  const usuario = await requireSesion();
  await marcarTodasLeidasServicio(usuario.id);
  revalidatePath("/notificaciones");
  return { ok: true };
}
