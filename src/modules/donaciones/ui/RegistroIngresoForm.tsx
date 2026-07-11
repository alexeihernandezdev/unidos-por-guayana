"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { MONEDAS_PERMITIDAS } from "@/modules/donaciones/domain/Moneda";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

// Opciones ligeras que la página (server component) pasa al formulario.
export type OpcionRecurso = { id: string; nombre: string; unidad: string };
export type OpcionMedio = { id: string; titular: string; moneda: string };
export type OpcionAyuda = { id: string; titulo: string };

// Valor sentinela para "sin seleccionar" en los selects opcionales (Radix Select
// no admite un item con value=""), que la página traduce a `null`.
export const SIN_SELECCION = "__ninguno__";

export type RegistroIngresoFormValores = {
  recursoId: string;
  monto: number;
  moneda: string;
  medioDonacionId: string;
  ayudaId: string;
  fechaRecepcion: string;
  referencia: string;
};

type Props = {
  action: (
    input: RegistroIngresoFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  recursos: OpcionRecurso[];
  medios: OpcionMedio[];
  ayudas: OpcionAyuda[];
  fechaHoy: string;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function RegistroIngresoForm({
  action,
  recursos,
  medios,
  ayudas,
  fechaHoy,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegistroIngresoFormValores>({
    defaultValues: {
      recursoId: recursos[0]?.id ?? "",
      monto: 0,
      moneda: MONEDAS_PERMITIDAS[0],
      medioDonacionId: SIN_SELECCION,
      ayudaId: SIN_SELECCION,
      fechaRecepcion: fechaHoy,
      referencia: "",
    },
  });

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        router.push("/panel/donaciones");
      } else {
        setErrorServidor(resultado.error ?? "No se pudo registrar el ingreso.");
      }
    });
  });

  if (recursos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay recursos de categoría monetaria. Crea uno en el catálogo de
        recursos para poder registrar ingresos.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Recurso monetario</span>
        <Controller
          control={control}
          name="recursoId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Recurso monetario" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recursos.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nombre} ({r.unidad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="monto" className="text-sm font-medium">
          Monto recibido
        </label>
        <input
          id="monto"
          type="number"
          step="0.01"
          min="0"
          className={campo}
          aria-invalid={Boolean(errors.monto)}
          {...register("monto", {
            valueAsNumber: true,
            required: "Indica el monto.",
            min: { value: 0.01, message: "El monto debe ser mayor que cero." },
          })}
        />
        {errors.monto && (
          <p className="text-sm text-destructive">{errors.monto.message}</p>
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
                {MONEDAS_PERMITIDAS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Medio de donación{" "}
          <span className="text-muted-foreground">(opcional)</span>
        </span>
        <Controller
          control={control}
          name="medioDonacionId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Medio de donación" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_SELECCION}>Sin especificar</SelectItem>
                {medios.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.titular} ({m.moneda})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Actividad asociada{" "}
          <span className="text-muted-foreground">(opcional)</span>
        </span>
        <Controller
          control={control}
          name="ayudaId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Actividad asociada" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_SELECCION}>
                  Caja general (sin actividad)
                </SelectItem>
                {ayudas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fechaRecepcion" className="text-sm font-medium">
          Fecha de recepción
        </label>
        <input
          id="fechaRecepcion"
          type="date"
          className={campo}
          aria-invalid={Boolean(errors.fechaRecepcion)}
          {...register("fechaRecepcion", {
            required: "Indica la fecha de recepción.",
          })}
        />
        {errors.fechaRecepcion && (
          <p className="text-sm text-destructive">
            {errors.fechaRecepcion.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="referencia" className="text-sm font-medium">
          Referencia{" "}
          <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="referencia"
          className={campo}
          placeholder="Número de operación, comprobante…"
          {...register("referencia")}
        />
      </div>

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Registrando…" : "Registrar ingreso"}
      </Button>
    </form>
  );
}
