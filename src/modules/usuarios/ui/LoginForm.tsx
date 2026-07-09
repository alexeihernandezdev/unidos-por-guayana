"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";

type Campos = { email: string; password: string };

type Props = {
  action: (input: Campos) => Promise<{ error: string } | undefined>;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function LoginForm({ action }: Props) {
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Campos>();

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      // En éxito el action redirige (no retorna); solo tratamos el error.
      const resultado = await action(datos);
      if (resultado?.error) {
        setErrorServidor(resultado.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={campo}
          aria-invalid={Boolean(errors.email)}
          {...register("email", { required: "Introduce tu email." })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={campo}
          aria-invalid={Boolean(errors.password)}
          {...register("password", { required: "Introduce tu contraseña." })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Entrando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
