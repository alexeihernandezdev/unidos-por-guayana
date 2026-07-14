"use server";

import { z } from "zod";
import {
  CategoriasAporteVaciasError,
  CedulaYaRegistradaError,
  DatosContactoInvalidosError,
  EmailYaRegistradoError,
  PerfilAdminInvalidoError,
  RolNoAutoRegistrableError,
} from "@/modules/usuarios/application/errors";
import {
  DatosPuntoAcopioInvalidosError,
  NombrePuntoDuplicadoError,
  UbicacionVaciaError,
} from "@/modules/acopio/application/errors";
import { CATEGORIAS_RECURSO } from "@/modules/recursos/domain/CategoriaRecurso";
import { crearPuntoAcopioServicio } from "@/shared/acopio";
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
// acopio; la feature 017 exige contacto + ubicación al COLABORADOR/SOLICITANTE
// y añade el flag WhatsApp en ambos flujos.
const CuentaSchema = z.object({
  nombre: z.string().trim().min(2, "Indica tu nombre.").max(80),
  email: z.email("Introduce un email válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(100),
});

const DatosContactoSchema = z.object({
  cedula: z.string().trim().min(1, "La cédula es obligatoria.").max(20),
  telefono: z.string().trim().min(1, "El teléfono es obligatorio.").max(20),
  telefonoEsWhatsApp: z.boolean(),
  estadoId: z.string().trim().min(1, "Selecciona el estado.").max(40),
  municipioId: z.string().trim().min(1, "Selecciona el municipio.").max(40),
});

// Categorías de aporte del COLABORADOR (feature 025): al menos una de las cuatro.
const CategoriasAporteSchema = z
  .array(z.enum(CATEGORIAS_RECURSO as unknown as [string, ...string[]]))
  .min(1, "Elige al menos una categoría que podrías aportar.");

// Primer punto de acopio del ADMIN (feature 011). Se captura en el registro; el
// contacto (teléfono/correo/WhatsApp) y la ubicación de catálogo se heredan del
// perfil. Las coordenadas vienen del mapa. El rango de coordenadas y la coherencia
// estado↔municipio los revalida el caso de uso `crearPuntoAcopio`.
const PrimerPuntoSchema = z.object({
  nombre: z.string().trim().min(1, "Indica el nombre del centro.").max(120),
  referencia: z
    .string()
    .trim()
    .min(1, "Indica una referencia para orientar a quien llega.")
    .max(200),
  horarios: z
    .string()
    .trim()
    .min(1, "Indica los horarios de atención.")
    .max(200),
  latitud: z.string().min(1, "Marca la ubicación del centro en el mapa."),
  longitud: z.string().min(1, "Marca la ubicación del centro en el mapa."),
});

const PerfilSchema = z.object({
  nombreCuenta: z.string().trim().min(1, "Indica el nombre de la cuenta.").max(120),
  estadoId: z.string().trim().min(1, "Selecciona el estado.").max(40),
  municipioId: z.string().trim().min(1, "Selecciona el municipio.").max(40),
  telefono: z.string().trim().min(1, "Indica un teléfono.").max(40),
  telefonoEsWhatsApp: z.boolean(),
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
    // Colaborador / solicitante: registro base + datos de contacto (017).
    if (rol === Rol.COLABORADOR || rol === Rol.SOLICITANTE) {
      const datosContacto = DatosContactoSchema.safeParse(input.datosContacto);
      if (!datosContacto.success) {
        return {
          ok: false,
          error:
            datosContacto.error.issues[0]?.message ??
            "Datos de contacto no válidos.",
        };
      }

      // El COLABORADOR declara sus categorías de aporte (feature 025).
      let categoriasAporte: string[] | undefined;
      if (rol === Rol.COLABORADOR) {
        const categorias = CategoriasAporteSchema.safeParse(
          input.categoriasAporte,
        );
        if (!categorias.success) {
          return {
            ok: false,
            error:
              categorias.error.issues[0]?.message ??
              "Elige al menos una categoría que podrías aportar.",
          };
        }
        categoriasAporte = categorias.data;
      }

      await registrarNuevoUsuario({
        ...cuenta.data,
        rol,
        datosContacto: datosContacto.data,
        categoriasAporte,
      });
      return { ok: true, rol };
    }

    // Administrador: registro público con perfil de centro de acopio (016+017)
    // y su primer punto de acopio (011).
    if (rol === Rol.ADMIN) {
      const perfil = PerfilSchema.safeParse(input.perfil);
      if (!perfil.success) {
        return {
          ok: false,
          error: perfil.error.issues[0]?.message ?? "Datos del perfil no válidos.",
        };
      }
      const punto = PrimerPuntoSchema.safeParse(input.primerPunto);
      if (!punto.success) {
        return {
          ok: false,
          error:
            punto.error.issues[0]?.message ??
            "Datos del centro de acopio no válidos.",
        };
      }
      // Crea la cuenta + perfil y, en el mismo alta, su primer punto. El contacto
      // y la ubicación del catálogo se heredan del perfil recién creado.
      const admin = await registrarAdministradorConPerfil(
        cuenta.data,
        perfil.data,
      );
      await crearPuntoAcopioServicio(admin.id, {
        nombre: punto.data.nombre,
        referencia: punto.data.referencia,
        horarios: punto.data.horarios,
        latitud: punto.data.latitud,
        longitud: punto.data.longitud,
        telefono: perfil.data.telefono,
        telefonoEsWhatsApp: perfil.data.telefonoEsWhatsApp,
        correo: perfil.data.correo,
        estadoId: perfil.data.estadoId,
        municipioId: perfil.data.municipioId,
      });
      return { ok: true, rol };
    }

    // Cualquier otro rol (p. ej. SUPERADMIN) no es auto-registrable.
    return { ok: false, error: "Ese rol no está permitido en el registro." };
  } catch (error) {
    if (error instanceof EmailYaRegistradoError) {
      return { ok: false, error: "Ya existe una cuenta con ese email." };
    }
    if (error instanceof CedulaYaRegistradaError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof DatosContactoInvalidosError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof RolNoAutoRegistrableError) {
      return { ok: false, error: "Ese rol no está permitido en el registro." };
    }
    if (error instanceof PerfilAdminInvalidoError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof CategoriasAporteVaciasError) {
      return { ok: false, error: error.message };
    }
    if (
      error instanceof DatosPuntoAcopioInvalidosError ||
      error instanceof UbicacionVaciaError ||
      error instanceof NombrePuntoDuplicadoError
    ) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}
