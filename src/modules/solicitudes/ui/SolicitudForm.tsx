"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  URGENCIAS_SOLICITUD,
  UrgenciaSolicitud,
} from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { Button } from "@/shared/ui/button";
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
  ) => Promise<{ ok: boolean; error?: string }>;
  recursos: RecursoOpcion[];
  valoresIniciales?: Partial<SolicitudFormValores>;
  textoEnviar: string;
  textoEnviando: string;
  rutaExito: string;
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
      if (resultado.ok) {
        router.push(rutaExito);
      } else {
        setErrorServidor(resultado.error ?? "No se pudo guardar la solicitud.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-2xl flex-col gap-4">
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
        <label htmlFor="urgencia" className="text-sm font-medium">
          Urgencia
        </label>
        <select
          id="urgencia"
          className={campo}
          {...register("urgencia", { required: "Indica la urgencia." })}
        >
          {URGENCIAS_SOLICITUD.map((u) => (
            <option key={u} value={u}>
              {URGENCIA_LABEL[u]}
            </option>
          ))}
        </select>
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
                    <label
                      htmlFor={`recurso-${index}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Recurso
                    </label>
                    <select
                      id={`recurso-${index}`}
                      className={campo}
                      {...register(`recursos.${index}.recursoId`, {
                        required: "Elige un recurso.",
                      })}
                    >
                      {recursos.map((recurso) => (
                        <option key={recurso.id} value={recurso.id}>
                          {recurso.nombre} ({recurso.unidad})
                        </option>
                      ))}
                    </select>
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
