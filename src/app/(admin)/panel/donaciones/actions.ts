"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  MontoInvalidoError,
  NoAutorizadoError,
  RecursoFueraDeMetasError,
  RecursoNoMonetarioError,
} from "@/modules/aportes/application/errors";
import {
  DatosMedioInvalidosError,
  MedioDonacionNoEncontradoError,
} from "@/modules/donaciones/application/errors";
import { MONEDAS_PERMITIDAS } from "@/modules/donaciones/domain/Moneda";
import { TipoMedioDonacion } from "@/modules/donaciones/domain/TipoMedioDonacion";
import { SIN_SELECCION } from "@/modules/donaciones/ui/RegistroIngresoForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { registrarAporteExternoServicio } from "@/shared/aportes";
import { requireAdminVerificado } from "@/shared/auth";
import {
  activarMedioDonacionServicio,
  crearMedioDonacionServicio,
  desactivarMedioDonacionServicio,
  editarMedioDonacionServicio,
} from "@/shared/donaciones";

const RUTA_LISTADO = "/panel/donaciones";
const RUTA_TRANSPARENCIA = "/transparencia";

type Resultado = { ok: true } | { ok: false; error: string };

// ── Medios de donación ──────────────────────────────────────────────────────

const MedioSchema = z.object({
  tipo: z.enum(TipoMedioDonacion, { message: "Tipo de medio no válido." }),
  titular: z.string().trim().min(1, "Indica el titular del medio.").max(160),
  moneda: z.enum(MONEDAS_PERMITIDAS, { message: "Moneda no válida." }),
  datos: z
    .string()
    .trim()
    .min(1, "Indica los datos de la instrucción.")
    .max(500),
  nota: z.string().trim().max(500).optional().or(z.literal("")),
  orden: z.coerce.number().int().min(0).max(9999).optional(),
});

export type MedioInput = {
  tipo: TipoMedioDonacion;
  titular: string;
  moneda: string;
  datos: string;
  nota: string;
  orden: number;
};

function traducirErrorMedio(error: unknown): Resultado | null {
  if (error instanceof DatosMedioInvalidosError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof MedioDonacionNoEncontradoError) {
    return { ok: false, error: "El medio de donación ya no existe." };
  }
  return null;
}

export async function crearMedioDonacionAction(
  input: MedioInput,
): Promise<Resultado> {
  await requireAdminVerificado();

  const parsed = MedioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await crearMedioDonacionServicio({
      tipo: parsed.data.tipo,
      titular: parsed.data.titular,
      moneda: parsed.data.moneda,
      datos: parsed.data.datos,
      nota: parsed.data.nota ?? null,
      orden: parsed.data.orden,
    });
    revalidatePath(RUTA_LISTADO);
    revalidatePath(RUTA_TRANSPARENCIA);
    return { ok: true };
  } catch (error) {
    const traducido = traducirErrorMedio(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function editarMedioDonacionAction(
  id: string,
  input: MedioInput,
): Promise<Resultado> {
  await requireAdminVerificado();

  const parsed = MedioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await editarMedioDonacionServicio(id, {
      tipo: parsed.data.tipo,
      titular: parsed.data.titular,
      moneda: parsed.data.moneda,
      datos: parsed.data.datos,
      nota: parsed.data.nota ?? null,
      orden: parsed.data.orden,
    });
    revalidatePath(RUTA_LISTADO);
    revalidatePath(RUTA_TRANSPARENCIA);
    return { ok: true };
  } catch (error) {
    const traducido = traducirErrorMedio(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function activarMedioDonacionAction(
  formData: FormData,
): Promise<void> {
  await requireAdminVerificado();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await activarMedioDonacionServicio(id);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(RUTA_TRANSPARENCIA);
  }
}

export async function desactivarMedioDonacionAction(
  formData: FormData,
): Promise<void> {
  await requireAdminVerificado();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await desactivarMedioDonacionServicio(id);
    revalidatePath(RUTA_LISTADO);
    revalidatePath(RUTA_TRANSPARENCIA);
  }
}

// ── Ingreso monetario externo ───────────────────────────────────────────────

const IngresoSchema = z.object({
  recursoId: z.string().min(1, "Elige un recurso monetario."),
  monto: z.coerce.number().positive("El monto debe ser mayor que cero."),
  moneda: z.enum(MONEDAS_PERMITIDAS, { message: "Moneda no válida." }),
  medioDonacionId: z.string().optional(),
  ayudaId: z.string().optional(),
  fechaRecepcion: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Indica la fecha de recepción."),
  referencia: z.string().trim().max(120).optional().or(z.literal("")),
});

export type IngresoInput = {
  recursoId: string;
  monto: number;
  moneda: string;
  medioDonacionId: string;
  ayudaId: string;
  fechaRecepcion: string;
  referencia: string;
};

// La fecha de recepción se guarda a nivel de día, en UTC (medianoche), coherente
// con el resto de fechas de la plataforma.
function parseFecha(fecha: string): Date {
  return new Date(`${fecha}T00:00:00.000Z`);
}

function opcional(valor: string | undefined): string | null {
  if (!valor || valor === SIN_SELECCION) return null;
  return valor;
}

function traducirErrorIngreso(error: unknown): Resultado | null {
  if (error instanceof RecursoNoMonetarioError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof MontoInvalidoError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof RecursoFueraDeMetasError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof NoAutorizadoError) {
    return { ok: false, error: error.message };
  }
  return null;
}

export async function registrarAporteExternoAction(
  input: IngresoInput,
): Promise<Resultado> {
  const admin = await requireAdminVerificado();

  const parsed = IngresoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await registrarAporteExternoServicio(
      {
        recursoId: parsed.data.recursoId,
        monto: parsed.data.monto,
        moneda: parsed.data.moneda,
        fechaRecepcion: parseFecha(parsed.data.fechaRecepcion),
        medioDonacionId: opcional(parsed.data.medioDonacionId),
        ayudaId: opcional(parsed.data.ayudaId),
        referencia: parsed.data.referencia || null,
      },
      { id: admin.id, rol: Rol.ADMIN },
    );
    revalidatePath(RUTA_LISTADO);
    revalidatePath(RUTA_TRANSPARENCIA);
    return { ok: true };
  } catch (error) {
    const traducido = traducirErrorIngreso(error);
    if (traducido) return traducido;
    throw error;
  }
}
