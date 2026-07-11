"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CATEGORIAS_RECURSO } from "@/modules/recursos/domain/CategoriaRecurso";
import { CategoriasAporteVaciasError } from "@/modules/usuarios/application/errors";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  afiliarseACentroServicio,
  dejarCentroServicio,
} from "@/shared/afiliaciones";
import { declararCategoriasServicio, requireRol } from "@/shared/auth";

type Resultado = { ok: true } | { ok: false; error: string };

const RUTA = "/mi-perfil";

const CategoriasSchema = z
  .array(z.enum(CATEGORIAS_RECURSO as unknown as [string, ...string[]]))
  .min(1, "Elige al menos una categoría que podrías aportar.");

/** El COLABORADOR actualiza las categorías que puede aportar (feature 025). */
export async function declararCategoriasAction(
  categorias: string[],
): Promise<Resultado> {
  const sesion = await requireRol(Rol.COLABORADOR);
  const parsed = CategoriasSchema.safeParse(categorias);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }
  try {
    await declararCategoriasServicio(sesion.id, parsed.data);
    revalidatePath(RUTA);
    return { ok: true };
  } catch (error) {
    if (error instanceof CategoriasAporteVaciasError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

/** El COLABORADOR se afilia a un centro de acopio (inmediato, feature 025). */
export async function afiliarseAction(adminId: string): Promise<Resultado> {
  const sesion = await requireRol(Rol.COLABORADOR);
  if (!adminId) return { ok: false, error: "Centro no válido." };
  await afiliarseACentroServicio(sesion.id, adminId);
  revalidatePath(RUTA);
  return { ok: true };
}

/** El COLABORADOR deja un centro al que estaba afiliado (feature 025). */
export async function dejarCentroAction(adminId: string): Promise<Resultado> {
  const sesion = await requireRol(Rol.COLABORADOR);
  if (!adminId) return { ok: false, error: "Centro no válido." };
  await dejarCentroServicio(sesion.id, adminId);
  revalidatePath(RUTA);
  return { ok: true };
}
