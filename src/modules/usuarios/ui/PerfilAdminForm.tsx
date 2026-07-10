"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { CatalogoUbicacionFormulario } from "@/modules/ubicacion/domain/Ubicacion";
import { UbicacionSelectFields } from "@/modules/ubicacion/ui/UbicacionSelectFields";
import {
  TipoDocumento,
  type DatosPerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import { Button } from "@/shared/ui/button";

type Props = {
  perfil: DatosPerfilAdmin;
  catalogo: CatalogoUbicacionFormulario;
  action: (input: DatosPerfilAdmin) => Promise<{ ok: boolean; error?: string }>;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function PerfilAdminForm({ perfil, catalogo, action }: Props) {
  const [pendiente, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<
    { tipo: "ok" | "error"; texto: string } | null
  >(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DatosPerfilAdmin>({ defaultValues: perfil });

  const onSubmit = handleSubmit((datos) => {
    setMensaje(null);
    startTransition(async () => {
      const resultado = await action(datos);
      setMensaje(
        resultado.ok
          ? { tipo: "ok", texto: "Perfil actualizado." }
          : {
              tipo: "error",
              texto: resultado.error ?? "No se pudo actualizar el perfil.",
            },
      );
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombreCuenta" className="text-sm font-medium">
          Nombre de la cuenta
        </label>
        <input
          id="nombreCuenta"
          className={campo}
          aria-invalid={Boolean(errors.nombreCuenta)}
          {...register("nombreCuenta", { required: "Indica el nombre de la cuenta." })}
        />
        {errors.nombreCuenta && (
          <p className="text-sm text-destructive">{errors.nombreCuenta.message}</p>
        )}
      </div>

      <UbicacionSelectFields<DatosPerfilAdmin>
        catalogo={catalogo}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefono" className="text-sm font-medium">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            className={campo}
            aria-invalid={Boolean(errors.telefono)}
            {...register("telefono", { required: "Indica un teléfono." })}
          />
          {errors.telefono && (
            <p className="text-sm text-destructive">{errors.telefono.message}</p>
          )}
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("telefonoEsWhatsApp")} />
            Este número recibe WhatsApp
          </label>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="correo" className="text-sm font-medium">
            Correo de contacto
          </label>
          <input
            id="correo"
            type="email"
            className={campo}
            aria-invalid={Boolean(errors.correo)}
            {...register("correo", { required: "Indica un correo de contacto." })}
          />
          {errors.correo && (
            <p className="text-sm text-destructive">{errors.correo.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tipoDocumento" className="text-sm font-medium">
            Tipo de documento
          </label>
          <select id="tipoDocumento" className={campo} {...register("tipoDocumento")}>
            <option value={TipoDocumento.JURIDICO}>Jurídico</option>
            <option value={TipoDocumento.NATURAL}>Natural</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="numeroDocumento" className="text-sm font-medium">
            Número de documento
          </label>
          <input
            id="numeroDocumento"
            className={campo}
            aria-invalid={Boolean(errors.numeroDocumento)}
            {...register("numeroDocumento", {
              required: "Indica el número de documento.",
            })}
          />
          {errors.numeroDocumento && (
            <p className="text-sm text-destructive">
              {errors.numeroDocumento.message}
            </p>
          )}
        </div>
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
