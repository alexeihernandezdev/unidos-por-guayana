"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";

export type CamposDatosCuenta = { nombre: string; email: string };

type Props = {
  valoresIniciales: CamposDatosCuenta;
  action: (
    input: CamposDatosCuenta,
  ) => Promise<{ ok: boolean; error?: string }>;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

/**
 * Edición de los datos de identidad de la cuenta (nombre y correo). Compartido
 * por el perfil de SUPERADMIN y AUDITOR (feature 035).
 */
export function DatosCuentaForm({ valoresIniciales, action }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<
    { tipo: "ok" | "error"; texto: string } | null
  >(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CamposDatosCuenta>({ defaultValues: valoresIniciales });

  const onSubmit = handleSubmit((datos) => {
    setMensaje(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        setMensaje({ tipo: "ok", texto: "Datos actualizados." });
        router.refresh();
      } else {
        setMensaje({
          tipo: "error",
          texto: resultado.error ?? "No se pudieron guardar los datos.",
        });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="nombre"
          className={campo}
          autoComplete="name"
          aria-invalid={Boolean(errors.nombre)}
          {...register("nombre", { required: "Indica tu nombre." })}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          type="email"
          className={campo}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email", { required: "Indica tu correo." })}
        />
        <p className="text-xs text-muted-foreground">
          Es el correo con el que inicias sesión.
        </p>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {mensaje && (
        <p
          role={mensaje.tipo === "error" ? "alert" : "status"}
          className={
            mensaje.tipo === "error"
              ? "text-sm text-destructive"
              : "text-sm text-green-600 dark:text-green-500"
          }
        >
          {mensaje.texto}
        </p>
      )}

      <div>
        <Button type="submit" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
