"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AporteNoEncontradoError,
  ActividadNoAceptaAportesError,
  DatosAporteInvalidosError,
  NoAutorizadoError,
  RecursoFueraDeMetasError,
  TransicionInvalidaError,
} from "@/modules/aportes/application/errors";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  cancelarAporteServicio,
  crearAporteServicio,
  marcarRecibidoServicio,
  revertirRecibidoServicio,
} from "@/shared/aportes";
import { requireAdminVerificado, requireRol } from "@/shared/auth";

// Validación en el límite. Las reglas de negocio también viven en los casos de uso;
// aquí se rechaza pronto con mensajes claros para la UI.
const CrearAporteSchema = z.object({
  recursoId: z.string().min(1, "Elige un recurso."),
  cantidad: z.number().positive("La cantidad debe ser mayor que cero."),
  nota: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CrearAporteInputUi = {
  recursoId: string;
  cantidad: number;
  nota: string;
};

type Resultado = { ok: true } | { ok: false; error: string };

function traducirError(error: unknown): Resultado | null {
  if (error instanceof DatosAporteInvalidosError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof ActividadNoAceptaAportesError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof RecursoFueraDeMetasError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof TransicionInvalidaError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof NoAutorizadoError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof AporteNoEncontradoError) {
    return { ok: false, error: "El aporte ya no existe." };
  }
  if (error instanceof ActividadNoEncontradaError) {
    return { ok: false, error: "La actividad ya no existe." };
  }
  return null;
}

/** Crea un aporte a una Actividad. Rol requerido: COLABORADOR o ADMIN. */
export async function crearAporteAction(
  actividadId: string,
  input: CrearAporteInputUi,
): Promise<Resultado> {
  const usuario = await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const parsed = CrearAporteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await crearAporteServicio({
      actividadId,
      recursoId: parsed.data.recursoId,
      colaboradorId: usuario.id,
      cantidad: parsed.data.cantidad,
      nota: parsed.data.nota ?? null,
    });
    revalidatePath("/mis-aportes");
    revalidatePath(`/panel/actividades/${actividadId}`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

/** Cancela un aporte propio (o cualquier COMPROMETIDO si eres ADMIN). */
export async function cancelarAporteAction(formData: FormData): Promise<void> {
  const usuario = await requireRol(Rol.COLABORADOR, Rol.ADMIN);
  const id = formData.get("id");
  const actividadId = formData.get("actividadId");
  if (typeof id !== "string" || !id) return;

  try {
    await cancelarAporteServicio(id, { id: usuario.id, rol: usuario.rol });
  } catch (error) {
    // La cancelación va por <form action>; si no se puede, dejamos que la próxima
    // navegación refresque y la UI vuelva a mostrar el estado real.
    if (traducirError(error) === null) throw error;
  }
  revalidatePath("/mis-aportes");
  if (typeof actividadId === "string" && actividadId) {
    revalidatePath(`/panel/actividades/${actividadId}`);
  }
}

/** Marca un aporte como RECIBIDO. Solo ADMIN verificado. */
export async function marcarRecibidoAction(formData: FormData): Promise<void> {
  const usuario = await requireAdminVerificado();
  const id = formData.get("id");
  const actividadId = formData.get("actividadId");
  if (typeof id !== "string" || !id) return;

  try {
    await marcarRecibidoServicio(id, { id: usuario.id, rol: usuario.rol });
  } catch (error) {
    if (traducirError(error) === null) throw error;
  }
  if (typeof actividadId === "string" && actividadId) {
    revalidatePath(`/panel/actividades/${actividadId}`);
  }
}

/** Revierte un aporte RECIBIDO → COMPROMETIDO. Solo ADMIN verificado. */
export async function revertirRecibidoAction(
  formData: FormData,
): Promise<void> {
  const usuario = await requireAdminVerificado();
  const id = formData.get("id");
  const actividadId = formData.get("actividadId");
  if (typeof id !== "string" || !id) return;

  try {
    await revertirRecibidoServicio(id, { id: usuario.id, rol: usuario.rol });
  } catch (error) {
    if (traducirError(error) === null) throw error;
  }
  if (typeof actividadId === "string" && actividadId) {
    revalidatePath(`/panel/actividades/${actividadId}`);
  }
}
