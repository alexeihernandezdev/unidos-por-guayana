"use client";

import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import {
  validarCedula,
  validarTelefono,
  validarUbicacion,
} from "@/modules/usuarios/domain/datosContacto";

// Campos de contacto y ubicación exigidos a COLABORADOR/SOLICITANTE
// (feature 017). Componente reutilizado por `RegistroForm`,
// `/completar-perfil` y `/mi-perfil`; la validación de formato la delega en
// el dominio para mantener una sola fuente de verdad entre cliente y servidor.

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

// Los formularios que usan este componente deben declarar estos nombres en su
// tipo `T`. `Path<T>` deja que React Hook Form haga la comprobación en tiempo
// de compilación (el campo existe y es del tipo esperado).
export type CamposDatosContacto = {
  cedula: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  estado: string;
  parroquia: string;
};

type Props<T extends FieldValues & CamposDatosContacto> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
};

export function DatosContactoFields<T extends FieldValues & CamposDatosContacto>({
  register,
  errors,
}: Props<T>) {
  const errorFor = (nombre: keyof CamposDatosContacto): string | undefined => {
    const e = errors[nombre as Path<T>];
    if (!e) return undefined;
    return typeof e.message === "string" ? e.message : undefined;
  };

  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <legend className="px-1 text-sm font-medium">
        Contacto y ubicación
      </legend>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cedula" className="text-sm font-medium">
            Cédula
          </label>
          <input
            id="cedula"
            className={campo}
            placeholder="V-12345678"
            aria-invalid={Boolean(errorFor("cedula"))}
            {...register("cedula" as Path<T>, {
              validate: (valor: unknown) => {
                const r = validarCedula(String(valor ?? ""));
                return r.ok ? true : r.error;
              },
            })}
          />
          {errorFor("cedula") && (
            <p className="text-sm text-destructive">{errorFor("cedula")}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            className={campo}
            placeholder="0412 1234567"
            aria-invalid={Boolean(errorFor("telefono"))}
            {...register("telefono" as Path<T>, {
              validate: (valor: unknown) => {
                const r = validarTelefono(String(valor ?? ""));
                return r.ok ? true : r.error;
              },
            })}
          />
          {errorFor("telefono") && (
            <p className="text-sm text-destructive">{errorFor("telefono")}</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("telefonoEsWhatsApp" as Path<T>)}
        />
        Este número recibe WhatsApp
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="estado" className="text-sm font-medium">
            Estado
          </label>
          <input
            id="estado"
            className={campo}
            placeholder="La Guaira"
            aria-invalid={Boolean(errorFor("estado"))}
            {...register("estado" as Path<T>, {
              validate: (valor: unknown) => {
                const r = validarUbicacion({
                  estado: String(valor ?? ""),
                  parroquia: "placeholder",
                });
                return r.ok ? true : r.error;
              },
            })}
          />
          {errorFor("estado") && (
            <p className="text-sm text-destructive">{errorFor("estado")}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="parroquia" className="text-sm font-medium">
            Parroquia
          </label>
          <input
            id="parroquia"
            className={campo}
            placeholder="Catia La Mar"
            aria-invalid={Boolean(errorFor("parroquia"))}
            {...register("parroquia" as Path<T>, {
              validate: (valor: unknown) => {
                const r = validarUbicacion({
                  estado: "placeholder",
                  parroquia: String(valor ?? ""),
                });
                return r.ok ? true : r.error;
              },
            })}
          />
          {errorFor("parroquia") && (
            <p className="text-sm text-destructive">{errorFor("parroquia")}</p>
          )}
        </div>
      </div>
    </fieldset>
  );
}
