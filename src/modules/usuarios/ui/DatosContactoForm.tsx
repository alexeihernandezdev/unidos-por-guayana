"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import { Button } from "@/shared/ui/button";
import { DatosContactoFields, type CamposDatosContacto } from "./DatosContactoFields";

type Modo = "completar" | "editar";

type Props = {
  modo: Modo;
  valoresIniciales?: Partial<DatosContacto>;
  action: (input: DatosContacto) => Promise<{ ok: boolean; error?: string }>;
  // Catálogo de ubicación (feature 020): estados y municipios para el selector.
  estados: Estado[];
  municipios: Municipio[];
  // Ruta a la que redirige tras un guardado correcto. En "completar" suele ser
  // `/` o la ruta que el guard interrumpió; en "editar" vuelve a `/mi-perfil`.
  destinoOk: string;
};

// Formulario compartido por `/completar-perfil` (primer login) y `/mi-perfil`
// (edición). La diferencia es solo el copy y los valores iniciales.
export function DatosContactoForm({
  modo,
  valoresIniciales,
  action,
  estados,
  municipios,
  destinoOk,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CamposDatosContacto>({
    defaultValues: {
      cedula: valoresIniciales?.cedula ?? "",
      telefono: valoresIniciales?.telefono ?? "",
      telefonoEsWhatsApp: valoresIniciales?.telefonoEsWhatsApp ?? true,
      estadoId: valoresIniciales?.estadoId ?? "",
      municipioId: valoresIniciales?.municipioId ?? "",
    },
  });

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    setGuardado(false);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        setGuardado(true);
        router.push(destinoOk);
        router.refresh();
      } else {
        setErrorServidor(resultado.error ?? "No se pudieron guardar los datos.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-lg flex-col gap-4">
      <DatosContactoFields<CamposDatosContacto>
        register={register}
        control={control}
        errors={errors}
        estados={estados}
        municipios={municipios}
      />

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}
      {guardado && !errorServidor && (
        <p className="text-sm text-green-600 dark:text-green-500" role="status">
          Datos guardados.
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente
          ? "Guardando…"
          : modo === "completar"
            ? "Completar perfil"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
