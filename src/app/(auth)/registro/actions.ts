"use server";

import { z } from "zod";
import {
  EmailYaRegistradoError,
  PerfilAdminInvalidoError,
  RolNoAutoRegistrableError,
} from "@/modules/usuarios/application/errors";
import { TipoDocumento } from "@/modules/usuarios/domain/PerfilAdmin";
import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  registrarAdministradorConPerfil,
  registrarNuevoUsuario,
} from "@/shared/auth";
import type { RegistroInput } from "@/modules/usuarios/ui/RegistroForm";

// Validación en el límite (servidor). Las reglas también viven en los casos de
// uso; aquí se rechaza pronto con mensajes claros. Desde la feature 015 `ADMIN`
// es de registro público; la feature 016 exige además su perfil de centro de
// acopio. El `SUPERADMIN` sigue fuera del registro.
const CuentaSchema = z.object({
  nombre: z.string().trim().min(2, "Indica tu nombre.").max(80),
  email: z.email("Introduce un email válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(100),
});

const PerfilSchema = z.object({
  nombreCuenta: z.string().trim().min(1, "Indica el nombre de la cuenta.").max(120),
  estado: z.string().trim().min(1, "Indica el estado.").max(80),
  parroquia: z.string().trim().min(1, "Indica la parroquia.").max(80),
  telefono: z.string().trim().min(1, "Indica un teléfono.").max(40),
  correo: z.email("Indica un correo de contacto válido."),
  tipoDocumento: z.enum(TipoDocumento, { message: "Tipo de documento no válido." }),
  numeroDocumento: z.string().trim().min(1, "Indica el número de documento.").max(40),
});

type Resultado = { ok: true; rol: Rol } | { ok: false; error: string };

export async function registrarUsuarioAction(
  input: RegistroInput,
): Promise<Resultado> {
  const cuenta = CuentaSchema.safeParse(input);
  if (!cuenta.success) {
    return {
      ok: false,
      error: cuenta.error.issues[0]?.message ?? "Datos no válidos.",
    };
  }

  const rol = input.rol;

  try {
    // Colaborador / solicitante: registro base.
    if (rol === Rol.COLABORADOR || rol === Rol.SOLICITANTE) {
      await registrarNuevoUsuario({ ...cuenta.data, rol });
      return { ok: true, rol };
    }

    // Administrador: registro público con perfil de centro de acopio (016).
    if (rol === Rol.ADMIN) {
      const perfil = PerfilSchema.safeParse(input.perfil);
      if (!perfil.success) {
        return {
          ok: false,
          error: perfil.error.issues[0]?.message ?? "Datos del perfil no válidos.",
        };
      }
      await registrarAdministradorConPerfil(cuenta.data, perfil.data);
      return { ok: true, rol };
    }

    // Cualquier otro rol (p. ej. SUPERADMIN) no es auto-registrable.
    return { ok: false, error: "Ese rol no está permitido en el registro." };
  } catch (error) {
    if (error instanceof EmailYaRegistradoError) {
      return { ok: false, error: "Ya existe una cuenta con ese email." };
    }
    if (error instanceof RolNoAutoRegistrableError) {
      return { ok: false, error: "Ese rol no está permitido en el registro." };
    }
    if (error instanceof PerfilAdminInvalidoError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}
