"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { PasswordInput } from "./PasswordInput";

export type CamposCambiarPassword = {
  passwordActual: string;
  passwordNueva: string;
  confirmar: string;
};

type Props = {
  action: (input: {
    passwordActual: string;
    passwordNueva: string;
  }) => Promise<{ ok: boolean; error?: string }>;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

/**
 * Cambio de contraseña con confirmación de la contraseña actual. La coincidencia
 * entre la nueva y su repetición se comprueba en cliente; el resto de reglas las
 * aplica el caso de uso en el servidor (feature 035).
 */
export function CambiarPasswordForm({ action }: Props) {
  const [pendiente, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<
    { tipo: "ok" | "error"; texto: string } | null
  >(null);
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<CamposCambiarPassword>({
    defaultValues: { passwordActual: "", passwordNueva: "", confirmar: "" },
  });

  const onSubmit = handleSubmit((datos) => {
    setMensaje(null);
    startTransition(async () => {
      const resultado = await action({
        passwordActual: datos.passwordActual,
        passwordNueva: datos.passwordNueva,
      });
      if (resultado.ok) {
        setMensaje({ tipo: "ok", texto: "Contraseña actualizada." });
        reset();
      } else {
        setMensaje({
          tipo: "error",
          texto: resultado.error ?? "No se pudo cambiar la contraseña.",
        });
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="passwordActual" className="text-sm font-medium">
          Contraseña actual
        </label>
        <PasswordInput
          id="passwordActual"
          className={campo}
          autoComplete="current-password"
          aria-invalid={Boolean(errors.passwordActual)}
          {...register("passwordActual", {
            required: "Introduce tu contraseña actual.",
          })}
        />
        {errors.passwordActual && (
          <p className="text-sm text-destructive">
            {errors.passwordActual.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="passwordNueva" className="text-sm font-medium">
          Contraseña nueva
        </label>
        <PasswordInput
          id="passwordNueva"
          className={campo}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.passwordNueva)}
          {...register("passwordNueva", {
            required: "Introduce la contraseña nueva.",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres.",
            },
            maxLength: {
              value: 100,
              message: "La contraseña no puede superar 100 caracteres.",
            },
          })}
        />
        {errors.passwordNueva && (
          <p className="text-sm text-destructive">
            {errors.passwordNueva.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmar" className="text-sm font-medium">
          Repetir contraseña nueva
        </label>
        <PasswordInput
          id="confirmar"
          className={campo}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmar)}
          {...register("confirmar", {
            required: "Repite la contraseña nueva.",
            validate: (valor) =>
              valor === getValues("passwordNueva") ||
              "Las contraseñas no coinciden.",
          })}
        />
        {errors.confirmar && (
          <p className="text-sm text-destructive">{errors.confirmar.message}</p>
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
          {pendiente ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}
