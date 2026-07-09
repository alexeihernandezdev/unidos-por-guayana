"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  DatosRecursoInvalidosError,
  NombreDuplicadoError,
  RecursoNoEncontradoError,
} from "@/modules/recursos/application/errors";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  activarRecursoServicio,
  archivarRecursoServicio,
  crearRecursoServicio,
  editarRecursoServicio,
} from "@/shared/recursos";
import { requireRol } from "@/shared/auth";

const RUTA_LISTADO = "/panel/recursos";

// Validación en el límite (servidor). La regla de negocio (unicidad, categoría
// válida) también vive en el caso de uso; aquí se rechaza pronto con mensajes
// claros. `zod` v4: `z.enum(objeto)` acepta el const-object del dominio.
const RecursoSchema = z.object({
  nombre: z.string().trim().min(1, "Indica el nombre del recurso.").max(120),
  unidad: z.string().trim().min(1, "Indica la unidad de medida.").max(60),
  categoria: z.enum(CategoriaRecurso, { message: "Categoría no válida." }),
  descripcion: z.string().trim().max(500).optional().or(z.literal("")),
});

export type RecursoInput = {
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string;
};

type Resultado = { ok: true } | { ok: false; error: string };

function traducirError(error: unknown): Resultado | null {
  if (error instanceof NombreDuplicadoError) {
    return { ok: false, error: "Ya existe un recurso con ese nombre." };
  }
  if (error instanceof DatosRecursoInvalidosError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof RecursoNoEncontradoError) {
    return { ok: false, error: "El recurso ya no existe." };
  }
  return null;
}

export async function crearRecursoAction(
  input: RecursoInput,
): Promise<Resultado> {
  await requireRol(Rol.ADMIN);

  const parsed = RecursoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await crearRecursoServicio({
      nombre: parsed.data.nombre,
      unidad: parsed.data.unidad,
      categoria: parsed.data.categoria,
      descripcion: parsed.data.descripcion ?? null,
    });
    revalidatePath(RUTA_LISTADO);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function editarRecursoAction(
  id: string,
  input: RecursoInput,
): Promise<Resultado> {
  await requireRol(Rol.ADMIN);

  const parsed = RecursoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    await editarRecursoServicio(id, {
      nombre: parsed.data.nombre,
      unidad: parsed.data.unidad,
      categoria: parsed.data.categoria,
      descripcion: parsed.data.descripcion ?? null,
    });
    revalidatePath(RUTA_LISTADO);
    return { ok: true };
  } catch (error) {
    const traducido = traducirError(error);
    if (traducido) return traducido;
    throw error;
  }
}

export async function archivarRecursoAction(formData: FormData): Promise<void> {
  await requireRol(Rol.ADMIN);
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await archivarRecursoServicio(id);
    revalidatePath(RUTA_LISTADO);
  }
}

export async function activarRecursoAction(formData: FormData): Promise<void> {
  await requireRol(Rol.ADMIN);
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await activarRecursoServicio(id);
    revalidatePath(RUTA_LISTADO);
  }
}
