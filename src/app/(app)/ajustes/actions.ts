"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSesion } from "@/shared/auth";
import {
  actualizarPreferenciaServicio,
  enviarCorreoPruebaServicio,
  TipoNotificacion,
} from "@/shared/notificaciones";

const tipos = Object.values(TipoNotificacion) as [string, ...string[]];
const schema = z.object({
  tipo: z.enum(tipos),
  canal: z.enum(["EMAIL", "WHATSAPP"]),
  activo: z.boolean(),
});

export type ResultadoAjuste = { ok: boolean; error?: string };

export async function actualizarPreferenciaAction(input: {
  tipo: string;
  canal: "EMAIL" | "WHATSAPP";
  activo: boolean;
}): Promise<ResultadoAjuste> {
  const usuario = await requireSesion();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "La preferencia enviada no es válida." };
  }
  try {
    await actualizarPreferenciaServicio(
      usuario.id,
      usuario.rol,
      parsed.data.tipo as (typeof TipoNotificacion)[keyof typeof TipoNotificacion],
      parsed.data.canal,
      parsed.data.activo,
    );
    revalidatePath("/ajustes");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo guardar la preferencia.",
    };
  }
}

export async function enviarCorreoPruebaAction(): Promise<ResultadoAjuste> {
  const usuario = await requireSesion();
  try {
    await enviarCorreoPruebaServicio(usuario.id);
    return { ok: true };
  } catch (error) {
    console.error("[smtp] Falló el correo de prueba:", error);
    return {
      ok: false,
      error:
        error instanceof Error &&
        error.message === "El servicio SMTP todavía no está configurado."
          ? error.message
          : "No se pudo enviar. Revisa la conexión y las credenciales SMTP.",
    };
  }
}
