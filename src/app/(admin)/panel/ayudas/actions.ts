"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ActividadNoPerteneceAlAdminError,
  AyudaNoEditableError,
  AyudaNoEncontradaError,
  DatosAyudaInvalidosError,
  RecursoInvalidoError,
  TransicionInvalidaError,
} from "@/modules/ayudas/application/errors";
import { TIPOS_ACTIVIDAD } from "@/modules/ayudas/domain/TipoActividad";
import {
  avanzarEstadoServicio,
  crearAyudaServicio,
  editarCabeceraServicio,
  eliminarAyudaServicio,
  guardarMetaServicio,
  quitarMetaServicio,
} from "@/shared/ayudas";
import { requireAdminVerificado } from "@/shared/auth";

const RUTA_LISTADO = "/panel/ayudas";

// Validación en el límite (servidor). Las reglas de negocio (recurso activo,
// transición válida, edición solo en RECOLECTANDO) también viven en los casos de
// uso; aquí se rechaza pronto con mensajes claros.
const MetaSchema = z.object({
  recursoId: z.string().min(1, "Elige un recurso."),
  cantidadObjetivo: z
    .number()
    .positive("La cantidad objetivo debe ser mayor que cero."),
});

const FechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Indica una fecha de salida válida.");

const CabeceraSchema = z.object({
  titulo: z.string().trim().min(1, "Indica un título para la actividad.").max(160),
  sectorDestino: z
    .string()
    .trim()
    .min(1, "Indica el sector de destino.")
    .max(160),
  fecha: FechaSchema,
  descripcion: z.string().trim().max(1000).optional().or(z.literal("")),
});

const TipoSchema = z.enum(TIPOS_ACTIVIDAD as unknown as [string, ...string[]], {
  message: "Elige el tipo de actividad.",
});

const CrearAyudaSchema = CabeceraSchema.extend({
  tipo: TipoSchema,
  metas: z.array(MetaSchema).min(1, "Añade al menos una meta de recurso."),
});

export type AyudaInput = {
  titulo: string;
  sectorDestino: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  metas: { recursoId: string; cantidadObjetivo: number }[];
};

type Resultado = { ok: true } | { ok: false; error: string };

// La fecha de salida se guarda a nivel de día, en UTC (medianoche), para mostrar
// siempre el mismo día que eligió el ADMIN sin desplazamientos por zona horaria.
function parseFecha(fecha: string): Date {
  return new Date(`${fecha}T00:00:00.000Z`);
}

function traducirError(error: unknown): Resultado | null {
  if (error instanceof DatosAyudaInvalidosError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof RecursoInvalidoError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof TransicionInvalidaError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof AyudaNoEditableError) {
    return { ok: false, error: error.message };
  }
  if (
    error instanceof AyudaNoEncontradaError ||
    error instanceof ActividadNoPerteneceAlAdminError
  ) {
    return { ok: false, error: "La actividad ya no existe." };
  }
  return null;
}

export async function crearAyudaAction(input: AyudaInput): Promise<Resultado> {
  const sesion = await requireAdminVerificado();

  const parsed = CrearAyudaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await crearAyudaServicio({
      adminId: sesion.id,
      titulo: parsed.data.titulo,
      sectorDestino: parsed.data.sectorDestino,
      fecha: parseFecha(parsed.data.fecha),
      tipo: parsed.data.tipo as (typeof TIPOS_ACTIVIDAD)[number],
      descripcion: parsed.data.descripcion ?? null,
      metas: parsed.data.metas,
    });
    revalidatePath(RUTA_LISTADO);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function editarCabeceraAction(
  id: string,
  input: AyudaInput,
): Promise<Resultado> {
  const sesion = await requireAdminVerificado();

  const parsed = CabeceraSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await editarCabeceraServicio(id, sesion.id, {
      titulo: parsed.data.titulo,
      sectorDestino: parsed.data.sectorDestino,
      fecha: parseFecha(parsed.data.fecha),
      descripcion: parsed.data.descripcion ?? null,
    });
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${id}`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function guardarMetaAction(
  ayudaId: string,
  input: { recursoId: string; cantidadObjetivo: number },
): Promise<Resultado> {
  const sesion = await requireAdminVerificado();

  const parsed = MetaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await guardarMetaServicio(ayudaId, sesion.id, parsed.data);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${ayudaId}`);
    revalidatePath(`${RUTA_LISTADO}/${ayudaId}/editar`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function quitarMetaAction(
  ayudaId: string,
  recursoId: string,
): Promise<Resultado> {
  const sesion = await requireAdminVerificado();

  try {
    await quitarMetaServicio(ayudaId, sesion.id, recursoId);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${ayudaId}`);
    revalidatePath(`${RUTA_LISTADO}/${ayudaId}/editar`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function avanzarEstadoAction(formData: FormData): Promise<void> {
  const sesion = await requireAdminVerificado();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await avanzarEstadoServicio(id, sesion.id);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${id}`);
  }
}

export async function eliminarAyudaAction(formData: FormData): Promise<void> {
  const sesion = await requireAdminVerificado();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await eliminarAyudaServicio(id, sesion.id);
    revalidatePath(RUTA_LISTADO);
  }
}
