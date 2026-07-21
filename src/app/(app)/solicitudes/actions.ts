"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ArchivoInvalidoError,
  ArchivoNoEncontradoError,
  DatosSolicitudInvalidosError,
  LimiteArchivosError,
  NoAutorizadoError,
  RecursoInvalidoError,
  SolicitudNoEditableError,
  SolicitudNoEncontradaError,
} from "@/modules/solicitudes/application/errors";
import {
  TipoArchivoSolicitud,
  type ArchivoSolicitud,
} from "@/modules/solicitudes/domain/ArchivoSolicitud";
import {
  DatosRecursoInvalidosError,
  NombreDuplicadoError,
} from "@/modules/recursos/application/errors";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import {
  URGENCIAS_SOLICITUD,
  UrgenciaSolicitud,
} from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { ConflictoAuditoriaError } from "@/modules/auditoria/application";
import {
  cancelarSolicitudServicio,
  confirmarArchivoServicio,
  crearSolicitudServicio,
  editarSolicitudServicio,
  eliminarArchivoServicio,
  prepararSubidaArchivoServicio,
} from "@/shared/solicitudes";
import { proponerRecursoServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { reenviarAuditoriaServicio } from "@/shared/auditoria";

const RUTA_LISTADO = "/solicitudes";

const RecursoSchema = z.object({
  recursoId: z.string().min(1, "Elige un recurso."),
  cantidadEstimada: z
    .number()
    .positive("La cantidad estimada debe ser mayor que cero.")
    .nullable()
    .optional(),
});

const SolicitudSchema = z.object({
  sector: z.string().trim().min(1, "Indica el sector o zona.").max(160),
  urgencia: z.enum(URGENCIAS_SOLICITUD as [string, ...string[]], {
    message: "Indica la urgencia.",
  }),
  descripcion: z
    .string()
    .trim()
    .min(1, "Describe la situación.")
    .max(2000),
  recursos: z
    .array(RecursoSchema)
    .min(1, "Añade al menos un recurso necesario."),
});

export type SolicitudInput = {
  sector: string;
  urgencia: UrgenciaSolicitud;
  descripcion: string;
  recursos: { recursoId: string; cantidadEstimada?: number | null }[];
};

type Resultado = { ok: true } | { ok: false; error: string };

export async function reenviarSolicitudAction(
  solicitudId: string,
): Promise<Resultado> {
  const usuario = await requireRol(Rol.SOLICITANTE);
  try {
    await reenviarAuditoriaServicio(solicitudId, usuario.id);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${solicitudId}`);
    revalidatePath("/auditoria/solicitudes");
    return { ok: true };
  } catch (error) {
    if (error instanceof ConflictoAuditoriaError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

function traducirError(
  error: unknown,
): { ok: false; error: string } | null {
  if (error instanceof DatosSolicitudInvalidosError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof RecursoInvalidoError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof SolicitudNoEditableError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof NoAutorizadoError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof SolicitudNoEncontradaError) {
    return { ok: false, error: "La solicitud ya no existe." };
  }
  if (error instanceof ArchivoInvalidoError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof LimiteArchivosError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof ArchivoNoEncontradoError) {
    return { ok: false, error: "El archivo ya no existe." };
  }
  return null;
}

export async function crearSolicitudAction(
  input: SolicitudInput,
): Promise<Resultado> {
  const usuario = await requireRol(Rol.SOLICITANTE);

  const parsed = SolicitudSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await crearSolicitudServicio(
      {
        sector: parsed.data.sector,
        urgencia: parsed.data.urgencia as UrgenciaSolicitud,
        descripcion: parsed.data.descripcion,
        recursos: parsed.data.recursos,
      },
      usuario.id,
    );
    revalidatePath(RUTA_LISTADO);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function editarSolicitudAction(
  id: string,
  input: SolicitudInput,
): Promise<Resultado> {
  const usuario = await requireRol(Rol.SOLICITANTE);

  const parsed = SolicitudSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await editarSolicitudServicio(
      id,
      {
        sector: parsed.data.sector,
        urgencia: parsed.data.urgencia as UrgenciaSolicitud,
        descripcion: parsed.data.descripcion,
        recursos: parsed.data.recursos,
      },
      usuario.id,
    );
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${id}`);
    revalidatePath(`${RUTA_LISTADO}/${id}/editar`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

// Feature 019 · propuesta de recurso por el solicitante.
const ProponerRecursoSchema = z.object({
  nombre: z.string().trim().min(1, "Indica el nombre del recurso.").max(120),
  unidad: z.string().trim().min(1, "Indica la unidad de medida.").max(60),
  categoria: z.enum(CategoriaRecurso, { message: "Categoría no válida." }),
  descripcion: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ProponerRecursoInput = {
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string;
};

export async function proponerRecursoAction(
  input: ProponerRecursoInput,
): Promise<Resultado> {
  const usuario = await requireRol(Rol.SOLICITANTE);

  const parsed = ProponerRecursoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await proponerRecursoServicio(
      {
        nombre: parsed.data.nombre,
        unidad: parsed.data.unidad,
        categoria: parsed.data.categoria,
        descripcion: parsed.data.descripcion ?? null,
      },
      usuario.id,
    );
    revalidatePath("/solicitudes/nueva");
    return { ok: true };
  } catch (error) {
    if (error instanceof NombreDuplicadoError) {
      return { ok: false, error: "Ya existe un recurso con ese nombre." };
    }
    if (error instanceof DatosRecursoInvalidosError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

export async function cancelarSolicitudAction(
  id: string,
): Promise<Resultado> {
  const usuario = await requireRol(Rol.SOLICITANTE);

  try {
    await cancelarSolicitudServicio(id, usuario.id);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(`${RUTA_LISTADO}/${id}`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

// ── Archivos de la solicitud (feature 031) ──────────────────────────────────
// La subida va directo del navegador a Supabase. El servidor solo (1) valida y firma
// la URL de subida, y (2) confirma los metadatos tras la subida. El binario nunca pasa
// por estas acciones, así que el tope de 1 MB de los server actions no aplica.

const TIPOS_ARCHIVO = [
  TipoArchivoSolicitud.PRINCIPAL,
  TipoArchivoSolicitud.ADJUNTO,
] as const;

const PrepararSubidaSchema = z.object({
  solicitudId: z.string().min(1),
  tipo: z.enum(TIPOS_ARCHIVO),
  contentType: z.string().min(1).max(160),
  tamanoBytes: z.number().int().positive(),
});

const ConfirmarArchivoSchema = z.object({
  solicitudId: z.string().min(1),
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
  const usuario = await requireRol(Rol.SOLICITANTE);

  const parsed = PrepararSubidaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos del archivo no válidos." };
  }

  try {
    const { path, url } = await prepararSubidaArchivoServicio(
      parsed.data,
      usuario.id,
    );
    return { ok: true, path, url };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

type ConfirmarResultado =
  | { ok: true; archivo: ArchivoSolicitud }
  | { ok: false; error: string };

export async function confirmarArchivoAction(
  input: ConfirmarArchivoInput,
): Promise<ConfirmarResultado> {
  const usuario = await requireRol(Rol.SOLICITANTE);

  const parsed = ConfirmarArchivoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos del archivo no válidos." };
  }

  try {
    const archivo = await confirmarArchivoServicio(parsed.data, usuario.id);
    revalidatePath(`${RUTA_LISTADO}/${parsed.data.solicitudId}`);
    revalidatePath(`${RUTA_LISTADO}/${parsed.data.solicitudId}/editar`);
    return { ok: true, archivo };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function eliminarArchivoAction(
  archivoId: string,
  solicitudId: string,
): Promise<Resultado> {
  const usuario = await requireRol(Rol.SOLICITANTE);

  try {
    await eliminarArchivoServicio(archivoId, usuario.id);
    revalidatePath(`${RUTA_LISTADO}/${solicitudId}`);
    revalidatePath(`${RUTA_LISTADO}/${solicitudId}/editar`);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}
