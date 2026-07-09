"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import type { RegistrarUsuarioInput } from "@/modules/usuarios/application/registrarUsuario";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { Button } from "@/shared/ui/button";

type Campos = {
  nombre: string;
  email: string;
  password: string;
  rol: typeof Rol.COLABORADOR | typeof Rol.SOLICITANTE;
};

type Props = {
  // El server action se recibe como prop desde la página (server component), así
  // el formulario no importa la capa `app` y se mantiene reutilizable.
  action: (
    input: RegistrarUsuarioInput,
  ) => Promise<{ ok: boolean; error?: string }>;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function RegistroForm({ action }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Campos>({ defaultValues: { rol: Rol.COLABORADOR } });

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        router.push("/login?registrado=1");
      } else {
        setErrorServidor(resultado.error ?? "No se pudo completar el registro.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="nombre"
          className={campo}
          aria-invalid={Boolean(errors.nombre)}
          {...register("nombre", {
            required: "Indica tu nombre.",
            minLength: { value: 2, message: "Indica tu nombre." },
          })}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

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
          autoComplete="new-password"
          className={campo}
          aria-invalid={Boolean(errors.password)}
          {...register("password", {
            required: "Crea una contraseña.",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres.",
            },
          })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="rol" className="text-sm font-medium">
          Quiero registrarme como
        </label>
        <select id="rol" className={campo} {...register("rol")}>
          <option value={Rol.COLABORADOR}>Colaborador (quiero aportar)</option>
          <option value={Rol.SOLICITANTE}>Solicitante (pido ayuda)</option>
        </select>
      </div>

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
