"use client";

import { useEffect, useMemo } from "react";
import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { CatalogoUbicacionFormulario } from "@/modules/ubicacion/domain/Ubicacion";
import { validarUbicacionIds } from "@/modules/ubicacion/domain/Ubicacion";

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export type CamposUbicacion = {
  estadoId: string;
  municipioId: string;
};

type Props<T extends FieldValues & CamposUbicacion> = {
  catalogo: CatalogoUbicacionFormulario;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  idPrefix?: string;
};

export function UbicacionSelectFields<T extends FieldValues & CamposUbicacion>({
  catalogo,
  register,
  watch,
  setValue,
  errors,
  idPrefix = "",
}: Props<T>) {
  const estadoId = watch("estadoId" as Path<T>) as string;
  const municipioId = watch("municipioId" as Path<T>) as string;

  useEffect(() => {
    if (!estadoId) {
      setValue("municipioId" as Path<T>, "" as T[Path<T>], { shouldValidate: true });
      return;
    }
    const validos = catalogo.municipiosPorEstado[estadoId] ?? [];
    if (municipioId && !validos.some((m) => m.id === municipioId)) {
      setValue("municipioId" as Path<T>, "" as T[Path<T>], { shouldValidate: true });
    }
  }, [catalogo.municipiosPorEstado, estadoId, municipioId, setValue]);

  const municipios = useMemo(
    () => (estadoId ? (catalogo.municipiosPorEstado[estadoId] ?? []) : []),
    [catalogo.municipiosPorEstado, estadoId],
  );

  const errorFor = (nombre: keyof CamposUbicacion): string | undefined => {
    const e = errors[nombre as Path<T>];
    if (!e) return undefined;
    return typeof e.message === "string" ? e.message : undefined;
  };

  const pref = idPrefix ? `${idPrefix}-` : "";

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${pref}estadoId`} className="text-sm font-medium">
          Estado
        </label>
        <select
          id={`${pref}estadoId`}
          className={campo}
          aria-invalid={Boolean(errorFor("estadoId"))}
          {...register("estadoId" as Path<T>, {
            validate: (valor: unknown) => {
              const r = validarUbicacionIds({
                estadoId: String(valor ?? ""),
                municipioId: "placeholder",
              });
              return r.ok ? true : r.error;
            },
          })}
        >
          <option value="">Selecciona un estado</option>
          {catalogo.estados.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estado.nombre}
            </option>
          ))}
        </select>
        {errorFor("estadoId") && (
          <p className="text-sm text-destructive">{errorFor("estadoId")}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${pref}municipioId`} className="text-sm font-medium">
          Municipio
        </label>
        <select
          id={`${pref}municipioId`}
          className={campo}
          disabled={!estadoId}
          aria-invalid={Boolean(errorFor("municipioId"))}
          {...register("municipioId" as Path<T>, {
            validate: (valor: unknown) => {
              const r = validarUbicacionIds({
                estadoId: "placeholder",
                municipioId: String(valor ?? ""),
              });
              return r.ok ? true : r.error;
            },
          })}
        >
          <option value="">
            {estadoId ? "Selecciona un municipio" : "Primero elige un estado"}
          </option>
          {municipios.map((municipio) => (
            <option key={municipio.id} value={municipio.id}>
              {municipio.nombre}
            </option>
          ))}
        </select>
        {errorFor("municipioId") && (
          <p className="text-sm text-destructive">{errorFor("municipioId")}</p>
        )}
      </div>
    </div>
  );
}
