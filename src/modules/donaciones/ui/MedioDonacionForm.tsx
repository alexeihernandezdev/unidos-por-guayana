"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { MONEDAS_PERMITIDAS } from "@/modules/donaciones/domain/Moneda";
import {
  TIPOS_MEDIO_DONACION,
  TipoMedioDonacion,
} from "@/modules/donaciones/domain/TipoMedioDonacion";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { TIPO_MEDIO_LABEL } from "./tipos";

export type MedioDonacionFormValores = {
  tipo: TipoMedioDonacion;
  titular: string;
  moneda: string;
  datos: string;
  nota: string;
  orden: number;
};

type Props = {
  // El server action se recibe como prop desde la página (server component), así el
  // formulario no importa la capa `app` y se reutiliza para alta y edición.
  action: (
    input: MedioDonacionFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  valoresIniciales?: Partial<MedioDonacionFormValores>;
  textoEnviar: string;
  textoEnviando: string;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function MedioDonacionForm({
  action,
  valoresIniciales,
  textoEnviar,
  textoEnviando,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MedioDonacionFormValores>({
    defaultValues: {
      tipo: valoresIniciales?.tipo ?? TipoMedioDonacion.CUENTA_BANCARIA,
      titular: valoresIniciales?.titular ?? "",
      moneda: valoresIniciales?.moneda ?? MONEDAS_PERMITIDAS[0],
      datos: valoresIniciales?.datos ?? "",
      nota: valoresIniciales?.nota ?? "",
      orden: valoresIniciales?.orden ?? 0,
    },
  });

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        router.push("/panel/donaciones");
      } else {
        setErrorServidor(resultado.error ?? "No se pudo guardar el medio.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Tipo de medio</span>
        <Controller
          control={control}
          name="tipo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Tipo de medio" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_MEDIO_DONACION.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_MEDIO_LABEL[tipo]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="titular" className="text-sm font-medium">
          Titular
        </label>
        <input
          id="titular"
          className={campo}
          placeholder="Nombre del titular de la cuenta o correo"
          aria-invalid={Boolean(errors.titular)}
          {...register("titular", {
            required: "Indica el titular del medio.",
            setValueAs: (v: string) => v.trim(),
            minLength: { value: 1, message: "Indica el titular del medio." },
          })}
        />
        {errors.titular && (
          <p className="text-sm text-destructive">{errors.titular.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Moneda</span>
        <Controller
          control={control}
          name="moneda"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Moneda" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONEDAS_PERMITIDAS.map((moneda) => (
                  <SelectItem key={moneda} value={moneda}>
                    {moneda}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="datos" className="text-sm font-medium">
          Datos de la instrucción
        </label>
        <textarea
          id="datos"
          rows={3}
          className={campo}
          placeholder="Número de cuenta, correo, alias, teléfono…"
          aria-invalid={Boolean(errors.datos)}
          {...register("datos", {
            required: "Indica los datos de la instrucción.",
            setValueAs: (v: string) => v.trim(),
            minLength: { value: 1, message: "Indica los datos de la instrucción." },
          })}
        />
        {errors.datos && (
          <p className="text-sm text-destructive">{errors.datos.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nota" className="text-sm font-medium">
          Nota o instrucción adicional{" "}
          <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea id="nota" rows={2} className={campo} {...register("nota")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="orden" className="text-sm font-medium">
          Orden en la lista
        </label>
        <input
          id="orden"
          type="number"
          className={campo}
          {...register("orden", { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Los medios se muestran de menor a mayor orden.
        </p>
      </div>

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? textoEnviando : textoEnviar}
      </Button>
    </form>
  );
}
