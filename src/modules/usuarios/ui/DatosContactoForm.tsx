"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import type { CatalogoUbicacionFormulario } from "@/modules/ubicacion/domain/Ubicacion";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import { Button } from "@/shared/ui/button";
import { DatosContactoFields, type CamposDatosContacto } from "./DatosContactoFields";

type Modo = "completar" | "editar";

type Props = {
  modo: Modo;
  catalogo: CatalogoUbicacionFormulario;
  valoresIniciales?: Partial<DatosContacto>;
  action: (input: DatosContacto) => Promise<{ ok: boolean; error?: string }>;
  destinoOk: string;
};

export function DatosContactoForm({
  modo,
  catalogo,
  valoresIniciales,
  action,
  destinoOk,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
        catalogo={catalogo}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
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
