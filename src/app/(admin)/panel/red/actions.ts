"use server";

import { revalidatePath } from "next/cache";
import { NoAutorizadoError } from "@/modules/afiliaciones/application/errors";
import { removerDeRedServicio } from "@/shared/afiliaciones";
import { requireAdminVerificado } from "@/shared/auth";

// El ADMIN remueve a un colaborador de su red (feature 025). La propiedad la
// comprueba el caso de uso; si el colaborador no está en su red, se ignora.
export async function removerDeRedAction(formData: FormData): Promise<void> {
  const sesion = await requireAdminVerificado();
  const colaboradorId = formData.get("colaboradorId");
  if (typeof colaboradorId !== "string" || !colaboradorId) return;
  try {
    await removerDeRedServicio(sesion.id, colaboradorId);
    revalidatePath("/panel/red");
  } catch (error) {
    if (error instanceof NoAutorizadoError) return;
    throw error;
  }
}
