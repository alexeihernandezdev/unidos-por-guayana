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

// Opción para el selector: recursos que forman parte de las metas de la Ayuda.
// La unidad se muestra junto al campo de cantidad para dar contexto al colaborador.
export type OpcionMeta = {
  recursoId: string;
  nombre: string;
  unidad: string;
};

export type AporteFormValores = {
  recursoId: string;
  cantidad: number;
  nota: string;
};

type Props = {
  action: (
    input: AporteFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  opciones: OpcionMeta[];
  volverHref: string;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function AporteForm({ action, opciones, volverHref }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AporteFormValores>({
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
    startTransition(async () => {
      const resultado = await action({
        recursoId: valores.recursoId,
        cantidad: Number(valores.cantidad),
        nota: valores.nota,
      });
      if (!resultado.ok) {
        setErrorServidor(resultado.error ?? "No se pudo registrar el aporte.");
        return;
      }
      router.push(volverHref);
      router.refresh();
    });
  });

  if (opciones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta actividad no tiene metas disponibles para aportar.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Recurso</span>
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
        <label htmlFor="cantidad" className="text-sm font-medium">
          Cantidad {unidad ? `(${unidad})` : ""}
        </label>
        <input
          id="cantidad"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          className={campo}
          aria-invalid={Boolean(errors.cantidad)}
          {...register("cantidad", {
            required: "Indica una cantidad.",
            valueAsNumber: true,
            validate: (v) =>
              (Number.isFinite(v) && v > 0) || "La cantidad debe ser mayor que cero.",
          })}
        />
        {errors.cantidad && (
          <p className="text-sm text-destructive">{errors.cantidad.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nota" className="text-sm font-medium">
          Nota (opcional)
        </label>
        <textarea
          id="nota"
          rows={3}
          maxLength={500}
          className={campo}
          placeholder="Ej.: lo llevo el sábado al punto de acopio."
          {...register("nota")}
        />
      </div>

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pendiente}>
          {pendiente ? "Enviando…" : "Registrar aporte"}
        </Button>
      </div>
    </form>
  );
}
