"use client";

import { useEffect, useState, useTransition } from "react";
import type {
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { Estado, Municipio } from "@/modules/ubicaciones/domain/Ubicacion";

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:opacity-50";

export type CamposEstadoMunicipio = {
  estadoId: string;
  municipioId: string;
};

type Props<T extends FieldValues & CamposEstadoMunicipio> = {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  watch: UseFormWatch<T>;
  errors: FieldErrors<T>;
  estados: Estado[];
  /** Carga municipios del estado elegido (server action o fetch). */
  cargarMunicipios: (estadoId: string) => Promise<Municipio[]>;
  /** Municipios iniciales si ya hay estado seleccionado (edición). */
  municipiosIniciales?: Municipio[];
  idPrefijo?: string;
};

export function EstadoMunicipioFields<
  T extends FieldValues & CamposEstadoMunicipio,
>({
  register,
  setValue,
  watch,
  errors,
  estados,
  cargarMunicipios,
  municipiosIniciales = [],
  idPrefijo = "",
}: Props<T>) {
  const estadoId = String(watch("estadoId" as Path<T>) ?? "");
  const [municipios, setMunicipios] = useState<Municipio[]>(municipiosIniciales);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!estadoId) {
      setMunicipios([]);
      return;
    }
    let cancelado = false;
    startTransition(async () => {
      const lista = await cargarMunicipios(estadoId);
      if (!cancelado) setMunicipios(lista);
    });
    return () => {
      cancelado = true;
    };
  }, [estadoId, cargarMunicipios]);

  const errorFor = (nombre: keyof CamposEstadoMunicipio): string | undefined => {
    const e = errors[nombre as Path<T>];
    if (!e) return undefined;
    return typeof e.message === "string" ? e.message : undefined;
  };

  const idEstado = `${idPrefijo}estadoId`;
  const idMunicipio = `${idPrefijo}municipioId`;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={idEstado} className="text-sm font-medium">
          Estado
        </label>
        <select
          id={idEstado}
          className={campo}
          aria-invalid={Boolean(errorFor("estadoId"))}
          {...register("estadoId" as Path<T>, {
            required: "Selecciona el estado.",
            onChange: () => {
              setValue(
                "municipioId" as Path<T>,
                "" as PathValue<T, Path<T>>,
                { shouldValidate: true },
              );
            },
          })}
        >
          <option value="">Selecciona un estado</option>
          {estados.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        {errorFor("estadoId") && (
          <p className="text-sm text-destructive">{errorFor("estadoId")}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={idMunicipio} className="text-sm font-medium">
          Municipio
        </label>
        <select
          id={idMunicipio}
          className={campo}
          disabled={!estadoId || pending}
          aria-invalid={Boolean(errorFor("municipioId"))}
          {...register("municipioId" as Path<T>, {
            required: "Selecciona el municipio.",
          })}
        >
          <option value="">
            {!estadoId
              ? "Elige primero el estado"
              : pending
                ? "Cargando…"
                : "Selecciona un municipio"}
          </option>
          {municipios.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
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
