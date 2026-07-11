"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ActividadNoPerteneceAlAdminError,
  ActividadNoEditableError,
  ActividadNoEncontradaError,
  DatosActividadInvalidosError,
  RecursoInvalidoError,
  TransicionInvalidaError,
} from "@/modules/actividades/application/errors";
import { TIPOS_ACTIVIDAD } from "@/modules/actividades/domain/TipoActividad";
import {
  avanzarEstadoServicio,
  crearActividadServicio,
  editarCabeceraServicio,
  eliminarActividadServicio,
  guardarMetaServicio,
  quitarMetaServicio,
} from "@/shared/actividades";
import { requireAdminVerificado } from "@/shared/auth";

const RUTA_LISTADO = "/panel/actividades";

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

const HoraSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Indica una hora de fin válida.")
  .optional()
  .or(z.literal(""));

const CabeceraSchema = z.object({
  titulo: z.string().trim().min(1, "Indica un título para la actividad.").max(160),
  sectorDestino: z
    .string()
    .trim()
    .min(1, "Indica el sector de destino.")
    .max(160),
  fecha: FechaSchema,
  horaFin: HoraSchema,
  descripcion: z.string().trim().max(1000).optional().or(z.literal("")),
  // Id del punto de acopio propio o "" (ninguno). La propiedad la valida el caso de uso.
  puntoAcopioId: z.string().optional().or(z.literal("")),
});

const TipoSchema = z.enum(TIPOS_ACTIVIDAD as unknown as [string, ...string[]], {
  message: "Elige el tipo de actividad.",
});

const CrearActividadSchema = CabeceraSchema.extend({
  tipo: TipoSchema,
  metas: z.array(MetaSchema).min(1, "Añade al menos una meta de recurso."),
});

export type ActividadInput = {
  titulo: string;
  sectorDestino: string;
  fecha: string;
  horaFin: string;
  tipo: string;
  descripcion: string;
  puntoAcopioId: string;
  metas: { recursoId: string; cantidadObjetivo: number }[];
};

type Resultado = { ok: true } | { ok: false; error: string };

// La fecha de inicio se guarda a nivel de día, en UTC (medianoche), para mostrar
// siempre el mismo día que eligió el ADMIN sin desplazamientos por zona horaria.
function parseFecha(fecha: string): Date {
  return new Date(`${fecha}T00:00:00.000Z`);
}

// La hora de fin (opcional, feature 024) se combina con el día de inicio en UTC.
// Vacía => null.
function parseHoraFin(fecha: string, horaFin?: string): Date | null {
  if (!horaFin) return null;
  return new Date(`${fecha}T${horaFin}:00.000Z`);
}

function traducirError(error: unknown): Resultado | null {
  if (error instanceof DatosActividadInvalidosError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof RecursoInvalidoError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof TransicionInvalidaError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof ActividadNoEditableError) {
    return { ok: false, error: error.message };
  }
  if (
    error instanceof ActividadNoEncontradaError ||
    error instanceof ActividadNoPerteneceAlAdminError
  ) {
    return { ok: false, error: "La actividad ya no existe." };
  }
  return null;
}

export async function crearActividadAction(input: ActividadInput): Promise<Resultado> {
  const sesion = await requireAdminVerificado();

  const parsed = CrearActividadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await crearActividadServicio({
      adminId: sesion.id,
      titulo: parsed.data.titulo,
      sectorDestino: parsed.data.sectorDestino,
      fecha: parseFecha(parsed.data.fecha),
      horaFin: parseHoraFin(parsed.data.fecha, parsed.data.horaFin),
      tipo: parsed.data.tipo as (typeof TIPOS_ACTIVIDAD)[number],
      descripcion: parsed.data.descripcion ?? null,
      puntoAcopioId: parsed.data.puntoAcopioId || null,
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
  input: ActividadInput,
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
      horaFin: parseHoraFin(parsed.data.fecha, parsed.data.horaFin),
      descripcion: parsed.data.descripcion ?? null,
      puntoAcopioId: parsed.data.puntoAcopioId || null,
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
  actividadId: string,
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
    await guardarMetaServicio(actividadId, sesion.id, parsed.data);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}`);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}/editar`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function quitarMetaAction(
  actividadId: string,
  recursoId: string,
): Promise<Resultado> {
  const sesion = await requireAdminVerificado();

  try {
    await quitarMetaServicio(actividadId, sesion.id, recursoId);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}`);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}/editar`);
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

export async function eliminarActividadAction(formData: FormData): Promise<void> {
  const sesion = await requireAdminVerificado();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await eliminarActividadServicio(id, sesion.id);
    revalidatePath(RUTA_LISTADO);
  }
}
