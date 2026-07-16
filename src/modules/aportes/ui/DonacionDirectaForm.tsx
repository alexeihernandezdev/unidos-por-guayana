"use client";

import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { OpcionMeta } from "./AporteForm";

// Registro de una donación directa (feature 029) por el ADMIN dueño: una persona
// donó a la actividad sin cuenta y el organizador la imputa. Queda como "Anónimo".
export type DonacionDirectaValores = {
  recursoId: string;
  cantidad: number;
  nota: string;
};

type Props = {
  action: (
    input: DonacionDirectaValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  opciones: OpcionMeta[];
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function DonacionDirectaForm({ action, opciones }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonacionDirectaValores>({
    defaultValues: {
      recursoId: opciones[0]?.recursoId ?? "",
      cantidad: 1,
      nota: "",
    },
  });

  const recursoId = useWatch({ control, name: "recursoId" });
  const unidad = opciones.find((o) => o.recursoId === recursoId)?.unidad ?? "";

  const onSubmit = handleSubmit((valores) => {
    setErrorServidor(null);
    setExito(false);
    startTransition(async () => {
      const resultado = await action({
        recursoId: valores.recursoId,
        cantidad: Number(valores.cantidad),
        nota: valores.nota,
      });
      if (!resultado.ok) {
        setErrorServidor(
          resultado.error ?? "No se pudo registrar la donación.",
        );
        return;
      }
      reset({ recursoId: valores.recursoId, cantidad: 1, nota: "" });
      setExito(true);
      router.refresh();
    });
  });

  if (opciones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Añade al menos una meta de recurso para poder registrar donaciones.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Recurso</span>
        <Controller
          control={control}
          name="recursoId"
          rules={{ required: "Elige un recurso." }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                aria-label="Recurso"
                aria-invalid={Boolean(errors.recursoId)}
                className="w-full"
              >
                <SelectValue placeholder="Elige un recurso…" />
              </SelectTrigger>
              <SelectContent>
                {opciones.map((o) => (
                  <SelectItem key={o.recursoId} value={o.recursoId}>
                    {o.nombre} ({o.unidad})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.recursoId && (
          <p className="text-sm text-destructive">{errors.recursoId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="donacion-cantidad"
          className="text-sm font-medium text-foreground"
        >
          Cantidad{" "}
          {unidad && (
            <span className="font-normal text-muted-foreground">({unidad})</span>
          )}
        </label>
        <input
          id="donacion-cantidad"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          className={`${campo} numeric-tnum`}
          aria-invalid={Boolean(errors.cantidad)}
          {...register("cantidad", {
            required: "Indica una cantidad.",
            valueAsNumber: true,
            validate: (v) =>
              (Number.isFinite(v) && v > 0) ||
              "La cantidad debe ser mayor que cero.",
          })}
        />
        {errors.cantidad && (
          <p className="text-sm text-destructive">{errors.cantidad.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="donacion-nota"
          className="text-sm font-medium text-foreground"
        >
          Nota{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="donacion-nota"
          rows={2}
          maxLength={500}
          className={campo}
          placeholder="Referencia interna del donante, si quieres dejar constancia."
          {...register("nota")}
        />
      </div>

      {errorServidor && (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorServidor}
        </p>
      )}
      {exito && (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Donación directa registrada como recibida.
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="sm" disabled={pendiente}>
          {pendiente ? "Registrando…" : "Registrar donación"}
        </Button>
      </div>
    </form>
  );
}
