"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  DatosPuntoAcopioInvalidosError,
  NombrePuntoDuplicadoError,
  PuntoAcopioAjenoError,
  PuntoAcopioNoEncontradoError,
  UbicacionVaciaError,
} from "@/modules/acopio/application/errors";
import {
  activarPuntoAcopioServicio,
  archivarPuntoAcopioServicio,
  crearPuntoAcopioServicio,
  editarPuntoAcopioServicio,
} from "@/shared/acopio";
import { requireAdminVerificado } from "@/shared/auth";

const RUTA_LISTADO = "/panel/puntos-acopio";

// Validación en el límite (servidor). Las reglas de negocio (herencia de
// ubicación, coherencia estado↔municipio, propiedad, unicidad por admin)
// también viven en los casos de uso; aquí se rechaza pronto con mensajes claros.
const coordenada = (min: number, max: number, mensaje: string) =>
  z
    .string()
    .trim()
    .refine((v) => {
      const n = Number(v.replace(",", "."));
      return Number.isFinite(n) && n >= min && n <= max;
    }, mensaje);

const PuntoAcopioSchema = z.object({
  nombre: z.string().trim().min(1, "Indica el nombre del centro.").max(120),
  referencia: z
    .string()
    .trim()
    .min(1, "Indica una referencia del centro.")
    .max(240),
  horarios: z
    .string()
    .trim()
    .min(1, "Indica los horarios de atención.")
    .max(240),
  telefono: z.string().trim().min(1, "Indica un teléfono del centro.").max(40),
  telefonoEsWhatsApp: z.boolean(),
  correo: z.email("El correo no es válido.").max(160).or(z.literal("")),
  estadoId: z.string().trim().min(1, "Selecciona el estado."),
  municipioId: z.string().trim().min(1, "Selecciona el municipio."),
  latitud: coordenada(-90, 90, "La latitud debe estar entre -90 y 90."),
  longitud: coordenada(-180, 180, "La longitud debe estar entre -180 y 180."),
});

export type PuntoAcopioInput = z.input<typeof PuntoAcopioSchema>;

type Resultado = { ok: true } | { ok: false; error: string };

function traducirError(error: unknown): Resultado | null {
  if (
    error instanceof NombrePuntoDuplicadoError ||
    error instanceof DatosPuntoAcopioInvalidosError ||
    error instanceof UbicacionVaciaError
  ) {
    return { ok: false, error: error.message };
  }
  if (error instanceof PuntoAcopioAjenoError) {
    return { ok: false, error: "Ese centro de acopio no es tuyo." };
  }
  if (error instanceof PuntoAcopioNoEncontradoError) {
    return { ok: false, error: "El centro de acopio ya no existe." };
  }
  // Unicidad (adminId, nombre) que el caso de uso fía a la base (P2002).
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  ) {
    return { ok: false, error: "Ya tienes un centro con ese nombre." };
  }
  return null;
}

export async function crearPuntoAcopioAction(
  input: PuntoAcopioInput,
): Promise<Resultado> {
  const usuario = await requireAdminVerificado();

  const parsed = PuntoAcopioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await crearPuntoAcopioServicio(usuario.id, {
      ...parsed.data,
      correo: parsed.data.correo || null,
    });
    revalidatePath(RUTA_LISTADO);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function editarPuntoAcopioAction(
  id: string,
  input: PuntoAcopioInput,
): Promise<Resultado> {
  const usuario = await requireAdminVerificado();

  const parsed = PuntoAcopioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await editarPuntoAcopioServicio(usuario.id, id, {
      ...parsed.data,
      correo: parsed.data.correo || null,
    });
    revalidatePath(RUTA_LISTADO);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function archivarPuntoAcopioAction(
  formData: FormData,
): Promise<void> {
  const usuario = await requireAdminVerificado();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await archivarPuntoAcopioServicio(usuario.id, id);
    revalidatePath(RUTA_LISTADO);
  }
}

export async function activarPuntoAcopioAction(
  formData: FormData,
): Promise<void> {
  const usuario = await requireAdminVerificado();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await activarPuntoAcopioServicio(usuario.id, id);
    revalidatePath(RUTA_LISTADO);
  }
}
