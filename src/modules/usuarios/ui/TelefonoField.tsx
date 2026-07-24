"use client";

import { useId, useState } from "react";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  PAISES_TELEFONO,
  PAIS_TELEFONO_DEFECTO,
  partesTelefonoE164,
  validarTelefono,
} from "@/modules/usuarios/domain/datosContacto";

// Campo de teléfono con selector de país (feature 012). Guarda el valor en el
// formulario ya en **E.164** (`+<dialCode><numeroNacional>`); el país y el número
// visibles son estado local del componente. La validación reutiliza el dominio
// (`validarTelefono`) para tener una sola fuente de verdad. Compatible con React
// Hook Form vía `useController`, por lo que sirve en cualquier formulario que ya
// exponga su `control` (registro, completar/editar perfil, perfil de admin).

function dialCodeDe(iso: string): string {
  return PAISES_TELEFONO.find((p) => p.iso === iso)?.dialCode ?? "58";
}

// Compone el E.164 a partir del país y el número tecleado. En Venezuela descarta
// el `0` nacional inicial. Devuelve "" si no hay dígitos (campo vacío).
function componer(iso: string, nacionalCrudo: string): string {
  let digitos = nacionalCrudo.replace(/\D/g, "");
  if (iso === "VE" && digitos.startsWith("0")) digitos = digitos.slice(1);
  if (!digitos) return "";
  return `+${dialCodeDe(iso)}${digitos}`;
}

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  // `true` o un mensaje: exige un número. `false`/omitido: opcional.
  required?: boolean | string;
};

export function TelefonoField<T extends FieldValues>({
  control,
  name,
  label = "Teléfono",
  required,
}: Props<T>) {
  const id = useId();
  const { field, fieldState } = useController<T>({
    control,
    name,
    rules: {
      validate: (valor: unknown) => {
        const v = String(valor ?? "");
        if (!v) {
          if (!required) return true;
          return typeof required === "string"
            ? required
            : "El teléfono es obligatorio.";
        }
        const r = validarTelefono(v);
        return r.ok ? true : r.error;
      },
    },
  });

  const inicial = field.value
    ? partesTelefonoE164(String(field.value))
    : { iso: PAIS_TELEFONO_DEFECTO, nacional: "" };
  const [iso, setIso] = useState(inicial.iso);
  const [nacional, setNacional] = useState(inicial.nacional);

  const actualizar = (nuevoIso: string, nuevoNacional: string) => {
    setIso(nuevoIso);
    setNacional(nuevoNacional);
    field.onChange(componer(nuevoIso, nuevoNacional));
  };

  const error = fieldState.error?.message;
  const pais = PAISES_TELEFONO.find((p) => p.iso === iso);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          aria-label="País del teléfono"
          className="shrink-0 rounded-md border bg-background px-2 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={iso}
          onChange={(e) => actualizar(e.target.value, nacional)}
        >
          {PAISES_TELEFONO.map((p) => (
            <option key={p.iso} value={p.iso}>
              {p.nombre} (+{p.dialCode})
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
          placeholder={pais?.ejemplo}
          aria-invalid={Boolean(error)}
          value={nacional}
          onChange={(e) => actualizar(iso, e.target.value)}
          onBlur={field.onBlur}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
