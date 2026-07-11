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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

// Selector de ubicación dependiente (feature 020): dos desplegables estado →
// municipio (Select de shadcn/Radix), integrado con React Hook Form vía
// useController. Al cambiar el estado se filtran los municipios y se resetea el
// municipio elegido. El catálogo (≈335 municipios) se precarga en el servidor y
// llega por props; el filtrado ocurre en el cliente.

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
        <span className="text-sm font-medium">Estado</span>
        <Select
          value={estadoId}
          name={estadoCtrl.field.name}
          onValueChange={(valor) => {
            estadoCtrl.field.onChange(valor);
            // Resetea el municipio: el elegido puede no pertenecer al nuevo estado.
            municipioCtrl.field.onChange("");
          }}
        >
          <SelectTrigger
            aria-label="Estado"
            aria-invalid={Boolean(errorEstado)}
            className="w-full"
          >
            <SelectValue placeholder="Selecciona un estado…" />
          </SelectTrigger>
          <SelectContent>
            {estados.map((estado) => (
              <SelectItem key={estado.id} value={estado.id}>
                {estado.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errorEstado && (
          <p className="text-sm text-destructive">{errorEstado}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Municipio</span>
        <Select
          value={String(municipioCtrl.field.value ?? "")}
          name={municipioCtrl.field.name}
          disabled={estadoId.length === 0}
          onValueChange={(valor) => municipioCtrl.field.onChange(valor)}
        >
          <SelectTrigger
            aria-label="Municipio"
            aria-invalid={Boolean(errorMunicipio)}
            className="w-full"
          >
            <SelectValue
              placeholder={
                estadoId.length === 0
                  ? "Elige primero un estado"
                  : "Selecciona un municipio…"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {municipiosDelEstado.map((municipio) => (
              <SelectItem key={municipio.id} value={municipio.id}>
                {municipio.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
