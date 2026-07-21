"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  DatosTestimonioInvalidosError,
  SolicitudTestimonioInvalidaError,
  TestimonioNoAutorizadoError,
  TestimonioNoEditableError,
  TestimonioNoEncontradoError,
} from "@/modules/testimonios/application";
import { LIMITES_TESTIMONIO } from "@/modules/testimonios/domain";
import type { TestimonioFormValores } from "@/modules/testimonios/ui";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { requireRol } from "@/shared/auth";
import {
  crearTestimonioServicio,
  editarTestimonioServicio,
  eliminarTestimonioServicio,
  retirarTestimonioServicio,
} from "@/shared/testimonios";

const Schema = z.object({
  titulo: z
    .string()
    .trim()
    .min(LIMITES_TESTIMONIO.TITULO_MIN)
    .max(LIMITES_TESTIMONIO.TITULO_MAX),
  contenido: z
    .string()
    .trim()
    .min(LIMITES_TESTIMONIO.CONTENIDO_MIN)
    .max(LIMITES_TESTIMONIO.CONTENIDO_MAX),
  solicitudId: z.string().max(120),
});

type Resultado = { ok: true } | { ok: false; error: string };

function refrescar() {
  revalidatePath("/mis-testimonios");
  revalidatePath("/testimonios");
  revalidatePath("/");
  revalidatePath("/panel/testimonios");
}

function errorConocido(error: unknown): Resultado | null {
  if (
    error instanceof DatosTestimonioInvalidosError ||
    error instanceof SolicitudTestimonioInvalidaError ||
    error instanceof TestimonioNoAutorizadoError ||
    error instanceof TestimonioNoEditableError ||
    error instanceof TestimonioNoEncontradoError
  ) {
    return { ok: false, error: error.message };
  }
  return null;
}

function datos(input: TestimonioFormValores) {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return null;
  return {
    titulo: parsed.data.titulo,
    contenido: parsed.data.contenido,
    solicitudId:
      parsed.data.solicitudId === "ninguna" ? null : parsed.data.solicitudId,
  };
}

export async function crearTestimonioAction(
  input: TestimonioFormValores,
): Promise<Resultado> {
  const actor = await requireRol(Rol.COLABORADOR, Rol.SOLICITANTE);
  const entrada = datos(input);
  if (!entrada) return { ok: false, error: "Revisa el título y el relato." };
  try {
    await crearTestimonioServicio(entrada, actor);
    refrescar();
    return { ok: true };
  } catch (error) {
    const conocido = errorConocido(error);
    if (conocido) return conocido;
    throw error;
  }
}

export async function editarTestimonioAction(
  id: string,
  input: TestimonioFormValores,
): Promise<Resultado> {
  const actor = await requireRol(Rol.COLABORADOR, Rol.SOLICITANTE);
  const entrada = datos(input);
  if (!entrada) return { ok: false, error: "Revisa el título y el relato." };
  try {
    await editarTestimonioServicio(id, entrada, actor);
    refrescar();
    return { ok: true };
  } catch (error) {
    const conocido = errorConocido(error);
    if (conocido) return conocido;
    throw error;
  }
}

export async function retirarTestimonioAction(id: string): Promise<Resultado> {
  const actor = await requireRol(Rol.COLABORADOR, Rol.SOLICITANTE);
  try {
    await retirarTestimonioServicio(id, actor);
    refrescar();
    return { ok: true };
  } catch (error) {
    const conocido = errorConocido(error);
    if (conocido) return conocido;
    throw error;
  }
}

export async function eliminarTestimonioAction(id: string): Promise<Resultado> {
  const actor = await requireRol(Rol.COLABORADOR, Rol.SOLICITANTE);
  try {
    await eliminarTestimonioServicio(id, actor);
    refrescar();
    return { ok: true };
  } catch (error) {
    const conocido = errorConocido(error);
    if (conocido) return conocido;
    throw error;
  }
}
