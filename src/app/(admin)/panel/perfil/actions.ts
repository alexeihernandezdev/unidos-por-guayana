"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  PerfilAdminInvalidoError,
  PerfilAdminNoEncontradoError,
} from "@/modules/usuarios/application/errors";
import { TipoDocumento } from "@/modules/usuarios/domain/PerfilAdmin";
import { actualizarPerfilAdminGestion, requireAdminVerificado } from "@/shared/auth";

const RUTA_PERFIL = "/panel/perfil";

// Validación en el límite. Las reglas de dominio (documento con tipo y número,
// correo válido) también viven en el caso de uso; aquí se rechaza pronto.
const PerfilSchema = z.object({
  nombreCuenta: z.string().trim().min(1, "Indica el nombre de la cuenta.").max(120),
  estado: z.string().trim().min(1, "Indica el estado.").max(80),
  parroquia: z.string().trim().min(1, "Indica la parroquia.").max(80),
  telefono: z.string().trim().min(1, "Indica un teléfono.").max(40),
  correo: z.email("Indica un correo de contacto válido."),
  tipoDocumento: z.enum(TipoDocumento, { message: "Tipo de documento no válido." }),
  numeroDocumento: z.string().trim().min(1, "Indica el número de documento.").max(40),
});

export type PerfilInput = z.infer<typeof PerfilSchema>;

type Resultado = { ok: true } | { ok: false; error: string };

export async function actualizarPerfilAction(
  input: PerfilInput,
): Promise<Resultado> {
  // Solo un ADMIN verificado edita su propio perfil; el id sale de la sesión.
  const sesion = await requireAdminVerificado();

  const parsed = PerfilSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await actualizarPerfilAdminGestion(sesion.id, parsed.data);
    revalidatePath(RUTA_PERFIL);
    return { ok: true };
  } catch (error) {
    if (error instanceof PerfilAdminInvalidoError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof PerfilAdminNoEncontradoError) {
      return { ok: false, error: "Tu cuenta aún no tiene un perfil de centro de acopio." };
    }
    throw error;
  }
}
