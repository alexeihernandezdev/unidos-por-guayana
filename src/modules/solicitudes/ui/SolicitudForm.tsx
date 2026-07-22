"use client";

import { useState, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  URGENCIAS_SOLICITUD,
  UrgenciaSolicitud,
} from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { URGENCIA_LABEL } from "./urgencias";

export type RecursoOpcion = {
  id: string;
  nombre: string;
  unidad: string;
};

export type RecursoSolicitudValor = {
  recursoId: string;
  cantidadEstimada?: number | null;
};

export type SolicitudFormValores = {
  sector: string;
  urgencia: UrgenciaSolicitud;
  descripcion: string;
  recursos: RecursoSolicitudValor[];
};

type Props = {
  action: (
    input: SolicitudFormValores,
  ) => Promise<{ ok: boolean; error?: string; id?: string }>;
  recursos: RecursoOpcion[];
  valoresIniciales?: Partial<SolicitudFormValores>;
  textoEnviar: string;
  textoEnviando: string;
  rutaExito: string;
  /** Ancho del formulario. Por defecto `max-w-2xl`; en layout de dos columnas se
   *  pasa `max-w-none` para que llene su columna. */
  className?: string;
  /**
   * Se ejecuta tras `action` exitosa y antes de navegar; recibe el `id` que devuelva
   * la acción (p. ej. la solicitud recién creada). Úsalo para trabajo posterior como
   * subir archivos. Puede devolver una ruta de destino que reemplaza a `rutaExito`.
   * Debe capturar sus propios errores (no lanzar): la solicitud ya está creada.
   */
  alExito?: (id: string | undefined) => Promise<string | void>;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function SolicitudForm({
  action,
  recursos,
  valoresIniciales,
  textoEnviar,
  textoEnviando,
  rutaExito,
  className,
  alExito,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SolicitudFormValores>({
    defaultValues: {
      sector: valoresIniciales?.sector ?? "",
      urgencia: valoresIniciales?.urgencia ?? UrgenciaSolicitud.MEDIA,
      descripcion: valoresIniciales?.descripcion ?? "",
      recursos:
        valoresIniciales?.recursos ??
        (recursos[0]
          ? [{ recursoId: recursos[0].id, cantidadEstimada: null }]
          : []),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "recursos" });

  const sinRecursos = recursos.length === 0;

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (!resultado.ok) {
        setErrorServidor(resultado.error ?? "No se pudo guardar la solicitud.");
        return;
      }
      const destino = alExito ? await alExito(resultado.id) : undefined;
      router.push(destino ?? rutaExito);
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className={cn("flex w-full flex-col gap-4", className ?? "max-w-2xl")}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sector" className="text-sm font-medium">
          Sector
        </label>
        <input
          id="sector"
          className={campo}
          placeholder="Petare Sur, Upata…"
          aria-invalid={Boolean(errors.sector)}
          {...register("sector", {
            required: "Indica el sector o zona.",
            setValueAs: (v: string) => v.trim(),
          })}
        />
        {errors.sector && (
          <p className="text-sm text-destructive">{errors.sector.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Urgencia</span>
        <Controller
          control={control}
          name="urgencia"
          rules={{ required: "Indica la urgencia." }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Urgencia" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {URGENCIAS_SOLICITUD.map((u) => (
                  <SelectItem key={u} value={u}>
                    {URGENCIA_LABEL[u]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={4}
          className={campo}
          placeholder="Describe la situación y qué necesitas…"
          aria-invalid={Boolean(errors.descripcion)}
          {...register("descripcion", {
            required: "Describe la situación.",
            setValueAs: (v: string) => v.trim(),
          })}
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion.message}</p>
        )}
      </div>

      <fieldset className="flex flex-col gap-3 border-t border-border pt-4">
        <legend className="text-sm font-medium">Recursos necesarios</legend>
        <p className="text-sm text-muted-foreground">
          Qué necesitas del catálogo. La cantidad estimada es opcional.
        </p>

        {sinRecursos ? (
          <p className="text-sm text-destructive">
            No hay recursos activos en el catálogo. Contacta al administrador.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {fields.map((field, index) => (
                <li
                  key={field.id}
                  className="flex flex-wrap items-end gap-3 sm:flex-nowrap"
                >
                  <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Recurso
                    </span>
                    <Controller
                      control={control}
                      name={`recursos.${index}.recursoId`}
                      rules={{ required: "Elige un recurso." }}
                      render={({ field: recursoField }) => (
                        <Select
                          value={recursoField.value}
                          onValueChange={recursoField.onChange}
                        >
                          <SelectTrigger
                            aria-label="Recurso"
                            className="w-full"
                          >
                            <SelectValue placeholder="Elige un recurso…" />
                          </SelectTrigger>
                          <SelectContent>
                            {recursos.map((recurso) => (
                              <SelectItem key={recurso.id} value={recurso.id}>
                                {recurso.nombre} ({recurso.unidad})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="flex w-36 flex-col gap-1.5">
                    <label
                      htmlFor={`cantidad-${index}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Cantidad est.
                    </label>
                    <input
                      id={`cantidad-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Opcional"
                      className={`${campo} numeric-tnum`}
                      {...register(`recursos.${index}.cantidadEstimada`, {
                        setValueAs: (v: string) =>
                          v === "" || v === undefined ? null : Number(v),
                        validate: (v) =>
                          v === null ||
                          v === undefined ||
                          (Number.isFinite(v) && v > 0) ||
                          "Debe ser mayor que cero.",
                      })}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar recurso"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 strokeWidth={1.5} />
                  </Button>
                </li>
              ))}
            </ul>

            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    recursoId: recursos[0]?.id ?? "",
                    cantidadEstimada: null,
                  })
                }
              >
                Añadir recurso
              </Button>
            </div>
          </>
        )}
      </fieldset>

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <Button type="submit" disabled={pendiente || sinRecursos}>
        {pendiente ? textoEnviando : textoEnviar}
      </Button>
    </form>
  );
}
