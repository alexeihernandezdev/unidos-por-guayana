"use server";

import { revalidatePath } from "next/cache";
import {
  ConflictoAuditoriaError,
  DictamenAuditoriaInvalidoError,
} from "@/modules/auditoria/application";
import { esResultadoAuditoria } from "@/modules/auditoria/domain";
import {
  dictaminarAuditoriaServicio,
  liberarAuditoriaServicio,
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
