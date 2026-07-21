"use server";

import { revalidatePath } from "next/cache";
import {
  DatosTestimonioInvalidosError,
  LimiteDestacadosError,
  TestimonioNoAutorizadoError,
  TestimonioNoEncontradoError,
  TransicionTestimonioInvalidaError,
} from "@/modules/testimonios/application";
import { requireAdminVerificado } from "@/shared/auth";
import {
  aprobarTestimonioServicio,
  destacarTestimonioServicio,
  ocultarTestimonioServicio,
  quitarDestacadoTestimonioServicio,
  rechazarTestimonioServicio,
} from "@/shared/testimonios";

type Resultado = { ok: true } | { ok: false; error: string };

function refrescar() {
  revalidatePath("/panel/testimonios");
  revalidatePath("/mis-testimonios");
  revalidatePath("/testimonios");
  revalidatePath("/");
}

function conocido(error: unknown): Resultado | null {
  if (
    error instanceof DatosTestimonioInvalidosError ||
    error instanceof LimiteDestacadosError ||
    error instanceof TestimonioNoAutorizadoError ||
    error instanceof TestimonioNoEncontradoError ||
    error instanceof TransicionTestimonioInvalidaError
  ) {
    return { ok: false, error: error.message };
  }
  return null;
}

async function ejecutar(
  operacion: (actor: Awaited<ReturnType<typeof requireAdminVerificado>>) => Promise<unknown>,
): Promise<Resultado> {
  const actor = await requireAdminVerificado();
  try {
    await operacion(actor);
    refrescar();
    return { ok: true };
  } catch (error) {
    const resultado = conocido(error);
    if (resultado) return resultado;
    throw error;
  }
}

export async function aprobarTestimonioAction(id: string): Promise<Resultado> {
  return ejecutar((actor) => aprobarTestimonioServicio(id, actor));
}

export async function rechazarTestimonioAction(
  id: string,
  motivo: string,
): Promise<Resultado> {
  return ejecutar((actor) => rechazarTestimonioServicio(id, motivo, actor));
}

export async function ocultarTestimonioAction(id: string): Promise<Resultado> {
  return ejecutar((actor) => ocultarTestimonioServicio(id, actor));
}

export async function destacarTestimonioAction(id: string): Promise<Resultado> {
  return ejecutar((actor) => destacarTestimonioServicio(id, actor));
}

export async function quitarDestacadoTestimonioAction(
  id: string,
): Promise<Resultado> {
  return ejecutar((actor) => quitarDestacadoTestimonioServicio(id, actor));
}
