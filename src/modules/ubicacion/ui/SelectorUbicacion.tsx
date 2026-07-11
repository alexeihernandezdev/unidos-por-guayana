"use client";

import { useMemo } from "react";
import {
  useController,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";

// Selector de ubicación dependiente (feature 020): dos desplegables estado →
// municipio, integrado con React Hook Form. Al cambiar el estado se filtran los
// municipios y se resetea el municipio elegido. El catálogo (≈335 municipios) se
// precarga en el servidor y llega por props; el filtrado ocurre en el cliente.

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

// Los formularios que usan este componente deben declarar estos nombres en su
// tipo `T` (dos strings con el id de catálogo).
export type CamposUbicacion = {
  estadoId: string;
  municipioId: string;
};

type Props<T extends FieldValues & CamposUbicacion> = {
  control: Control<T>;
  errors: FieldErrors<T>;
  estados: Estado[];
  municipios: Municipio[];
};

export function SelectorUbicacion<T extends FieldValues & CamposUbicacion>({
  control,
  errors,
  estados,
  municipios,
}: Props<T>) {
  const estadoCtrl = useController({
    control,
    name: "estadoId" as Path<T>,
    rules: { required: "Selecciona el estado." },
  });
  const municipioCtrl = useController({
    control,
    name: "municipioId" as Path<T>,
    rules: { required: "Selecciona el municipio." },
  });

  const estadoId = String(estadoCtrl.field.value ?? "");
  const municipiosDelEstado = useMemo(
    () => municipios.filter((municipio) => municipio.estadoId === estadoId),
    [municipios, estadoId],
  );

  const errorEstado = mensajeDe(errors, "estadoId");
  const errorMunicipio = mensajeDe(errors, "municipioId");

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="estadoId" className="text-sm font-medium">
          Estado
        </label>
        <select
          id="estadoId"
          className={campo}
          aria-invalid={Boolean(errorEstado)}
          value={estadoId}
          name={estadoCtrl.field.name}
          onChange={(event) => {
            estadoCtrl.field.onChange(event.target.value);
            // Resetea el municipio: el elegido puede no pertenecer al nuevo estado.
            municipioCtrl.field.onChange("");
          }}
        >
          <option value="">Selecciona un estado…</option>
          {estados.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estado.nombre}
            </option>
          ))}
        </select>
        {errorEstado && (
          <p className="text-sm text-destructive">{errorEstado}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="municipioId" className="text-sm font-medium">
          Municipio
        </label>
        <select
          id="municipioId"
          className={campo}
          aria-invalid={Boolean(errorMunicipio)}
          disabled={estadoId.length === 0}
          value={String(municipioCtrl.field.value ?? "")}
          name={municipioCtrl.field.name}
          onChange={(event) => municipioCtrl.field.onChange(event.target.value)}
        >
          <option value="">
            {estadoId.length === 0
              ? "Elige primero un estado"
              : "Selecciona un municipio…"}
          </option>
          {municipiosDelEstado.map((municipio) => (
            <option key={municipio.id} value={municipio.id}>
              {municipio.nombre}
            </option>
          ))}
        </select>
        {errorMunicipio && (
          <p className="text-sm text-destructive">{errorMunicipio}</p>
        )}
      </div>
    </div>
  );
}

function mensajeDe<T extends FieldValues>(
  errors: FieldErrors<T>,
  nombre: keyof CamposUbicacion,
): string | undefined {
  const error = errors[nombre as Path<T>];
  if (!error) return undefined;
  return typeof error.message === "string" ? error.message : undefined;
}
