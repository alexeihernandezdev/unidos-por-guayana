"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ConflictoAuditoriaError,
  DictamenAuditoriaInvalidoError,
  EvidenciaInvalidaError,
  EvidenciaNoEncontradaError,
  LimiteEvidenciasError,
  SolicitudAuditoriaNoEncontradaError,
  SoloAuditorError,
} from "@/modules/auditoria/application";
import {
  esResultadoAuditoria,
  type ArchivoEvidenciaAuditoria,
} from "@/modules/auditoria/domain";
import {
  confirmarEvidenciaServicio,
  dictaminarAuditoriaServicio,
  eliminarEvidenciaServicio,
  liberarAuditoriaServicio,
  prepararSubidaEvidenciaServicio,
  tomarAuditoriaServicio,
} from "@/shared/auditoria";
import { requireAuditorActivo } from "@/shared/auth";
import type { DictamenEstado } from "@/modules/auditoria/ui/FormularioDictamenAuditoria";

const RUTA = "/auditoria/solicitudes";

function valor(formData: FormData, nombre: string): string {
  const dato = formData.get(nombre);
  return typeof dato === "string" ? dato : "";
}

export async function tomarSolicitudAction(formData: FormData): Promise<void> {
  const actor = await requireAuditorActivo();
  const solicitudId = valor(formData, "solicitudId");
  if (!solicitudId) return;
  try {
    await tomarAuditoriaServicio(actor, solicitudId);
    revalidatePath(RUTA);
    revalidatePath(`${RUTA}/${solicitudId}`);
  } catch (error) {
    if (error instanceof ConflictoAuditoriaError) return;
    throw error;
  }
}

export async function liberarSolicitudAction(formData: FormData): Promise<void> {
  const actor = await requireAuditorActivo();
  const solicitudId = valor(formData, "solicitudId");
  if (!solicitudId) return;
  try {
    await liberarAuditoriaServicio(actor, solicitudId);
    revalidatePath(RUTA);
    revalidatePath(`${RUTA}/${solicitudId}`);
  } catch (error) {
    if (error instanceof ConflictoAuditoriaError) return;
    throw error;
  }
}

export async function emitirDictamenAction(
  _estado: DictamenEstado,
  formData: FormData,
): Promise<DictamenEstado> {
  const actor = await requireAuditorActivo();
  const solicitudId = valor(formData, "solicitudId");
  const resultado = valor(formData, "resultado");
  if (!solicitudId || !esResultadoAuditoria(resultado)) {
    return { ok: false, mensaje: "Selecciona un resultado válido." };
  }

  try {
    await dictaminarAuditoriaServicio(actor, solicitudId, {
      resultado,
      metodo: valor(formData, "metodo"),
      notaInterna: valor(formData, "notaInterna"),
      explicacionPublica: valor(formData, "explicacionPublica"),
      referenciaExterna: valor(formData, "referenciaExterna"),
    });
    revalidatePath(RUTA);
    revalidatePath(`${RUTA}/${solicitudId}`);
    revalidatePath("/panel/solicitudes");
    revalidatePath("/solicitudes");
    return { ok: true, mensaje: "Dictamen registrado correctamente." };
  } catch (error) {
    if (
      error instanceof ConflictoAuditoriaError ||
      error instanceof DictamenAuditoriaInvalidoError
    ) {
      return { ok: false, mensaje: error.message };
    }
    throw error;
  }
}

// ── Evidencia de verificación (feature 032) ──
// La subida va directo del navegador a Supabase; el servidor solo firma la URL y confirma
// los metadatos. Solo el auditor que tiene la solicitud EN_REVISION puede gestionarla.

const PrepararEvidenciaSchema = z.object({
  solicitudId: z.string().min(1),
  contentType: z.string().min(1).max(160),
  tamanoBytes: z.number().int().positive(),
});

const ConfirmarEvidenciaSchema = z.object({
  solicitudId: z.string().min(1),
  path: z.string().min(1).max(400),
  nombreOriginal: z.string().trim().min(1).max(255),
  contentType: z.string().min(1).max(160),
  tamanoBytes: z.number().int().positive(),
});

export type PrepararSubidaEvidenciaInput = z.infer<
  typeof PrepararEvidenciaSchema
>;
export type ConfirmarEvidenciaInput = z.infer<typeof ConfirmarEvidenciaSchema>;

function traducirEvidencia(
  error: unknown,
): { ok: false; error: string } | null {
  if (
    error instanceof EvidenciaInvalidaError ||
    error instanceof LimiteEvidenciasError ||
    error instanceof EvidenciaNoEncontradaError ||
    error instanceof ConflictoAuditoriaError ||
    error instanceof SolicitudAuditoriaNoEncontradaError ||
    error instanceof SoloAuditorError
  ) {
    return { ok: false, error: error.message };
  }
  return null;
}

type PrepararEvidenciaResultado =
  | { ok: true; path: string; url: string }
  | { ok: false; error: string };

export async function prepararSubidaEvidenciaAction(
  input: PrepararSubidaEvidenciaInput,
): Promise<PrepararEvidenciaResultado> {
  const actor = await requireAuditorActivo();

  const parsed = PrepararEvidenciaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos de la evidencia no válidos." };
  }

  try {
    const { path, url } = await prepararSubidaEvidenciaServicio(
      actor,
      parsed.data,
    );
    return { ok: true, path, url };
  } catch (error) {
    const traducido = traducirEvidencia(error);
    if (traducido) return traducido;
    throw error;
  }
}

type ConfirmarEvidenciaResultado =
  | { ok: true; evidencia: ArchivoEvidenciaAuditoria }
  | { ok: false; error: string };

export async function confirmarEvidenciaAction(
  input: ConfirmarEvidenciaInput,
): Promise<ConfirmarEvidenciaResultado> {
  const actor = await requireAuditorActivo();

  const parsed = ConfirmarEvidenciaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos de la evidencia no válidos." };
  }

  try {
    const evidencia = await confirmarEvidenciaServicio(actor, parsed.data);
    revalidatePath(`${RUTA}/${parsed.data.solicitudId}`);
    return { ok: true, evidencia };
  } catch (error) {
    const traducido = traducirEvidencia(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function eliminarEvidenciaAction(
  evidenciaId: string,
  solicitudId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireAuditorActivo();

  try {
    await eliminarEvidenciaServicio(actor, evidenciaId, solicitudId);
    revalidatePath(`${RUTA}/${solicitudId}`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirEvidencia(error);
    if (traducido) return traducido;
    throw error;
  }
}
