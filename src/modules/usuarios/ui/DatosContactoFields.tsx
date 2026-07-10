"use client";

import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { CatalogoUbicacionFormulario } from "@/modules/ubicacion/domain/Ubicacion";
import { UbicacionSelectFields } from "@/modules/ubicacion/ui/UbicacionSelectFields";
import {
  validarCedula,
  validarTelefono,
} from "@/modules/usuarios/domain/datosContacto";

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export type CamposDatosContacto = {
  cedula: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  estadoId: string;
  municipioId: string;
};

type Props<T extends FieldValues & CamposDatosContacto> = {
  catalogo: CatalogoUbicacionFormulario;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
};

export function DatosContactoFields<T extends FieldValues & CamposDatosContacto>({
  catalogo,
  register,
  watch,
  setValue,
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

      <UbicacionSelectFields
        catalogo={catalogo}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
      />
    </fieldset>
  );
}
