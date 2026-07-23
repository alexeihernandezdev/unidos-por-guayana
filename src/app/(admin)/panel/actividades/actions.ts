"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ActividadNoPerteneceAlAdminError,
  ActividadNoEditableError,
  ActividadNoEncontradaError,
  ArchivoInvalidoError,
  ArchivoNoEncontradoError,
  DatosActividadInvalidosError,
  LimiteArchivosError,
  RecursoInvalidoError,
  TransicionInvalidaError,
} from "@/modules/actividades/application/errors";
import {
  TipoArchivoActividad,
  type ArchivoActividad,
} from "@/modules/actividades/domain/ArchivoActividad";
import { TIPOS_ACTIVIDAD } from "@/modules/actividades/domain/TipoActividad";
import {
  AtencionNoEncontradaError,
  NecesidadNoEncontradaError,
  NecesidadNoPendienteError,
  NecesidadYaAtendidaError,
  RecursoNoSeleccionableError,
} from "@/modules/atenciones/application/errors";
import {
  avanzarEstadoServicio,
  confirmarArchivoServicio,
  crearActividadServicio,
  editarCabeceraServicio,
  eliminarActividadServicio,
  eliminarArchivoServicio,
  guardarMetaServicio,
  prepararSubidaArchivoServicio,
  quitarMetaServicio,
} from "@/shared/actividades";
import {
  desvincularNecesidadServicio,
  vincularNecesidadesServicio,
  vincularNecesidadServicio,
} from "@/shared/atenciones";
import { requireAdminVerificado } from "@/shared/auth";

const RUTA_LISTADO = "/panel/actividades";
// Vistas de solicitud que muestran el badge "Atendido por actividad X" (feature 030).
// Se revalidan al vincular/desvincular para que la cobertura derivada se refresque.
const RUTA_SOLICITUDES_ADMIN = "/panel/solicitudes";
const RUTA_SOLICITUDES_APP = "/solicitudes";

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
  // Ids de los centros de acopio propios (0..N, feature 026). La propiedad y la
  // deduplicación las valida el caso de uso.
  puntosAcopioIds: z.array(z.string()).optional(),
});

const TipoSchema = z.enum(TIPOS_ACTIVIDAD as unknown as [string, ...string[]], {
  message: "Elige el tipo de actividad.",
});

const CrearActividadSchema = CabeceraSchema.extend({
  tipo: TipoSchema,
  metas: z.array(MetaSchema).min(1, "Añade al menos una meta de recurso."),
  // Necesidades (RecursoSolicitud) que el ADMIN arrastró al crear la actividad
  // (feature 030). Se vinculan tras persistir la actividad, una a una y tolerando
  // fallos (otra actividad pudo tomarlas entre el arrastre y el submit).
  recursoSolicitudIds: z.array(z.string()).optional(),
});

export type ActividadInput = {
  titulo: string;
  sectorDestino: string;
  fecha: string;
  horaFin: string;
  tipo: string;
  descripcion: string;
  puntosAcopioIds: string[];
  metas: { recursoId: string; cantidadObjetivo: number }[];
  recursoSolicitudIds?: string[];
};

// `aviso` acompaña un resultado correcto cuando la acción principal funcionó pero algo
// secundario no (p. ej. no se pudieron vincular todas las necesidades arrastradas).
type Resultado = { ok: true; aviso?: string } | { ok: false; error: string };

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

function traducirError(
  error: unknown,
): { ok: false; error: string } | null {
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
  // Archivos (feature 033).
  if (error instanceof ArchivoInvalidoError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof LimiteArchivosError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof ArchivoNoEncontradoError) {
    return { ok: false, error: "El archivo ya no existe." };
  }
  // Errores del puente de atenciones (feature 030): todos son mensajes claros de
  // negocio que se muestran tal cual.
  if (
    error instanceof NecesidadNoEncontradaError ||
    error instanceof NecesidadNoPendienteError ||
    error instanceof NecesidadYaAtendidaError ||
    error instanceof RecursoNoSeleccionableError ||
    error instanceof AtencionNoEncontradaError
  ) {
    return { ok: false, error: error.message };
  }
  return null;
}

// La creación devuelve el `id` para que el cliente pueda subir a continuación los
// archivos elegidos (imagen principal + documentos) directo al almacenamiento con ese
// `id`, sin pasar por el servidor (feature 033, subida al crear).
type CrearResultado =
  | { ok: true; id: string; aviso?: string }
  | { ok: false; error: string };

export async function crearActividadAction(
  input: ActividadInput,
): Promise<CrearResultado> {
  const sesion = await requireAdminVerificado();

  const parsed = CrearActividadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    const actividad = await crearActividadServicio({
      adminId: sesion.id,
      titulo: parsed.data.titulo,
      sectorDestino: parsed.data.sectorDestino,
      fecha: parseFecha(parsed.data.fecha),
      horaFin: parseHoraFin(parsed.data.fecha, parsed.data.horaFin),
      tipo: parsed.data.tipo as (typeof TIPOS_ACTIVIDAD)[number],
      descripcion: parsed.data.descripcion ?? null,
      puntosAcopioIds: parsed.data.puntosAcopioIds ?? [],
      metas: parsed.data.metas,
    });

    // Vincula las necesidades arrastradas a la actividad ya creada (feature 030). Es
    // tolerante a fallos: si alguna no pudo atenderse, la actividad queda creada igual
    // y se avisa cuántas quedaron fuera.
    const recursoSolicitudIds = parsed.data.recursoSolicitudIds ?? [];
    const fallidas =
      recursoSolicitudIds.length > 0
        ? await vincularNecesidadesServicio(
            actividad.id,
            sesion.id,
            recursoSolicitudIds,
          )
        : [];

    revalidatePath(RUTA_LISTADO);
    if (fallidas.length > 0) {
      revalidatePath(RUTA_SOLICITUDES_ADMIN);
      revalidatePath(RUTA_SOLICITUDES_APP);
      return {
        ok: true,
        id: actividad.id,
        aviso: `La actividad se creó, pero ${fallidas.length} necesidad(es) ya no estaban disponibles y no se vincularon.`,
      };
    }
    if (recursoSolicitudIds.length > 0) {
      revalidatePath(RUTA_SOLICITUDES_ADMIN);
      revalidatePath(RUTA_SOLICITUDES_APP);
    }
    return { ok: true, id: actividad.id };
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
      puntosAcopioIds: parsed.data.puntosAcopioIds ?? [],
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

// Vincula una necesidad a una actividad existente en edición (feature 030). Crea la
// meta del recurso si no existía y registra la atención; refresca actividad y solicitudes.
export async function vincularNecesidadAction(
  actividadId: string,
  recursoSolicitudId: string,
): Promise<Resultado> {
  const sesion = await requireAdminVerificado();

  try {
    await vincularNecesidadServicio(actividadId, sesion.id, recursoSolicitudId);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}`);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}/editar`);
    revalidatePath(RUTA_SOLICITUDES_ADMIN);
    revalidatePath(RUTA_SOLICITUDES_APP);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

// Desvincula una necesidad de una actividad en edición: la necesidad vuelve al sidebar.
// La meta creada se conserva (el ADMIN la quita con quitarMetaAction si ya no la quiere).
export async function desvincularNecesidadAction(
  actividadId: string,
  atencionId: string,
): Promise<Resultado> {
  const sesion = await requireAdminVerificado();

  try {
    await desvincularNecesidadServicio(sesion.id, atencionId);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}`);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}/editar`);
    revalidatePath(RUTA_SOLICITUDES_ADMIN);
    revalidatePath(RUTA_SOLICITUDES_APP);
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

// ── Archivos de la actividad (feature 033) ──────────────────────────────────
// La subida va directo del navegador a Supabase (bucket público). El servidor solo
// (1) valida y firma la URL de subida, y (2) confirma los metadatos tras la subida. El
// binario nunca pasa por estas acciones. Solo el ADMIN dueño gestiona, en cualquier estado.

const TIPOS_ARCHIVO = [
  TipoArchivoActividad.PRINCIPAL,
  TipoArchivoActividad.ADJUNTO,
] as const;

const PrepararSubidaSchema = z.object({
  actividadId: z.string().min(1),
  tipo: z.enum(TIPOS_ARCHIVO),
  contentType: z.string().min(1).max(160),
  tamanoBytes: z.number().int().positive(),
});

const ConfirmarArchivoSchema = z.object({
  actividadId: z.string().min(1),
  tipo: z.enum(TIPOS_ARCHIVO),
  path: z.string().min(1).max(400),
  nombreOriginal: z.string().trim().min(1).max(255),
  contentType: z.string().min(1).max(160),
  tamanoBytes: z.number().int().positive(),
});

export type PrepararSubidaArchivoInput = z.infer<typeof PrepararSubidaSchema>;
export type ConfirmarArchivoInput = z.infer<typeof ConfirmarArchivoSchema>;

type PrepararResultado =
  | { ok: true; path: string; url: string }
  | { ok: false; error: string };

export async function prepararSubidaArchivoAction(
  input: PrepararSubidaArchivoInput,
): Promise<PrepararResultado> {
  const sesion = await requireAdminVerificado();

  const parsed = PrepararSubidaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos del archivo no válidos." };
  }

  try {
    const { path, url } = await prepararSubidaArchivoServicio(
      parsed.data,
      sesion.id,
    );
    return { ok: true, path, url };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

type ConfirmarResultado =
  | { ok: true; archivo: ArchivoActividad }
  | { ok: false; error: string };

export async function confirmarArchivoAction(
  input: ConfirmarArchivoInput,
): Promise<ConfirmarResultado> {
  const sesion = await requireAdminVerificado();

  const parsed = ConfirmarArchivoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos del archivo no válidos." };
  }

  try {
    const archivo = await confirmarArchivoServicio(parsed.data, sesion.id);
    revalidatePath(`${RUTA_LISTADO}/${parsed.data.actividadId}`);
    return { ok: true, archivo };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function eliminarArchivoAction(
  archivoId: string,
  actividadId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sesion = await requireAdminVerificado();

  try {
    await eliminarArchivoServicio(archivoId, sesion.id);
    revalidatePath(`${RUTA_LISTADO}/${actividadId}`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}
