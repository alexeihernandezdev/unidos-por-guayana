"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  PerfilAdminInvalidoError,
  PerfilAdminNoEncontradoError,
} from "@/modules/usuarios/application/errors";
import { TipoDocumento } from "@/modules/usuarios/domain/PerfilAdmin";
import { normalizarTelefono } from "@/modules/usuarios/domain/datosContacto";
import {
  actualizarPerfilAdminGestion,
  obtenerPerfilAdminGestion,
  requireAdminVerificado,
} from "@/shared/auth";
import {
  DestinoVerificacionTelefono,
  iniciarVerificacionTelefonoServicio,
  telefonoPendienteServicio,
} from "@/shared/verificacion-telefono";

const RUTA_PERFIL = "/panel/perfil";

// Validación en el límite. Las reglas de dominio (documento con tipo y número,
// correo válido) también viven en el caso de uso; aquí se rechaza pronto.
const PerfilSchema = z.object({
  nombreCuenta: z.string().trim().min(1, "Indica el nombre de la cuenta.").max(120),
  estadoId: z.string().trim().min(1, "Selecciona el estado.").max(40),
  municipioId: z.string().trim().min(1, "Selecciona el municipio.").max(40),
  telefono: z.string().trim().min(1, "Indica un teléfono.").max(40),
  correo: z.email("Indica un correo de contacto válido."),
  tipoDocumento: z.enum(TipoDocumento, { message: "Tipo de documento no válido." }),
  numeroDocumento: z.string().trim().min(1, "Indica el número de documento.").max(40),
});

export type PerfilInput = z.infer<typeof PerfilSchema>;

type Resultado = { ok: true } | { ok: false; error: string };

export async function actualizarPerfilAction(
  input: PerfilInput,
): Promise<Resultado> {
  // Solo un ADMIN verificado edita su propio perfil; el id sale de la sesión.
  const sesion = await requireAdminVerificado();

  const parsed = PerfilSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  try {
    const actual = await obtenerPerfilAdminGestion(sesion.id);
    if (!actual) {
      return {
        ok: false,
        error: "Tu cuenta aún no tiene un perfil de centro de acopio.",
      };
    }
    const telefonoNuevo =
      normalizarTelefono(parsed.data.telefono) ?? parsed.data.telefono;
    const telefonoCambio = actual.telefono !== telefonoNuevo;
    await actualizarPerfilAdminGestion(sesion.id, {
      ...parsed.data,
      telefono: actual.telefono,
    });
    if (telefonoCambio) {
      try {
        await iniciarVerificacionTelefonoServicio(
          sesion.id,
          DestinoVerificacionTelefono.PERFIL_ADMIN,
          telefonoNuevo,
        );
      } catch {
        if (!(await telefonoPendienteServicio(sesion.id))) {
          return {
            ok: false,
            error:
              "No pudimos iniciar la verificación. Tu teléfono anterior se conserva.",
          };
        }
      }
    }
    revalidatePath(RUTA_PERFIL);
    return { ok: true };
  } catch (error) {
    if (error instanceof PerfilAdminInvalidoError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof PerfilAdminNoEncontradoError) {
      return { ok: false, error: "Tu cuenta aún no tiene un perfil de centro de acopio." };
    }
    throw error;
  }
}
