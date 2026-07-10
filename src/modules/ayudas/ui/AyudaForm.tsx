"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  TIPOS_ACTIVIDAD,
  TipoActividad,
} from "@/modules/ayudas/domain/TipoActividad";
import { Button } from "@/shared/ui/button";
import { etiquetaTipo, nombreSingular } from "./tipos";

// Opción de recurso para el selector de metas (recursos activos del catálogo).
export type RecursoOpcion = {
  id: string;
  nombre: string;
  unidad: string;
};

export type MetaValor = {
  recursoId: string;
  cantidadObjetivo: number;
};

export type AyudaFormValores = {
  titulo: string;
  sectorDestino: string;
  // Fecha de salida a nivel de día (yyyy-mm-dd). El servidor la interpreta en UTC.
  fecha: string;
  // Tipo de actividad. Solo se pide en el alta (feature 018): en edición de
  // cabecera es inmutable y el form omite el campo.
  tipo: TipoActividad;
  descripcion: string;
  metas: MetaValor[];
};

type Props = {
  // El server action se recibe como prop desde la página (server component), así el
  // formulario no importa la capa `app` y se reutiliza para alta y edición.
  action: (
    input: AyudaFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  // Recursos activos disponibles para las metas. En modo edición de cabecera puede
  // venir vacío (las metas se gestionan aparte con `MetasEditor`).
  recursos: RecursoOpcion[];
  // Si es `true`, incluye la lista dinámica de metas (alta). Si es `false`, solo
  // edita la cabecera.
  conMetas?: boolean;
  valoresIniciales?: Partial<AyudaFormValores>;
  textoEnviar: string;
  textoEnviando: string;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AyudaForm({
  action,
  recursos,
  conMetas = false,
  valoresIniciales,
  textoEnviar,
  textoEnviando,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AyudaFormValores>({
    defaultValues: {
      titulo: valoresIniciales?.titulo ?? "",
      sectorDestino: valoresIniciales?.sectorDestino ?? "",
      fecha: valoresIniciales?.fecha ?? hoyISO(),
      tipo: valoresIniciales?.tipo ?? TipoActividad.ENVIO,
      descripcion: valoresIniciales?.descripcion ?? "",
      metas:
        valoresIniciales?.metas ??
        (conMetas && recursos[0]
          ? [{ recursoId: recursos[0].id, cantidadObjetivo: 1 }]
          : []),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "metas" });
  // El botón de alta se renombra según el tipo elegido en el desplegable
  // ("Crear envío" / "Crear jornada" / "Crear evento social", feature 018).
  const tipoSeleccionado = watch("tipo");
  const textoEnviarDinamico = conMetas
    ? `Crear ${nombreSingular(tipoSeleccionado)}`
    : textoEnviar;
  const textoEnviandoDinamico = conMetas ? "Creando…" : textoEnviando;

  const sinRecursos = conMetas && recursos.length === 0;

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        router.push("/panel/ayudas");
      } else {
        setErrorServidor(resultado.error ?? "No se pudo guardar el envío.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-2xl flex-col gap-4">
      {conMetas && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tipo" className="text-sm font-medium">
            Tipo de actividad
          </label>
          <select
            id="tipo"
            className={campo}
            aria-invalid={Boolean(errors.tipo)}
            {...register("tipo", { required: "Elige el tipo de actividad." })}
          >
            {TIPOS_ACTIVIDAD.map((t) => (
              <option key={t} value={t}>
                {etiquetaTipo(t)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium">
          Título
        </label>
        <input
          id="titulo"
          className={campo}
          placeholder="Envío a Upata, agua y alimentos"
          aria-invalid={Boolean(errors.titulo)}
          {...register("titulo", {
            required: "Indica un título para el envío.",
            setValueAs: (v: string) => v.trim(),
          })}
        />
        {errors.titulo && (
          <p className="text-sm text-destructive">{errors.titulo.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="sectorDestino" className="text-sm font-medium">
            Sector de destino
          </label>
          <input
            id="sectorDestino"
            className={campo}
            placeholder="Upata, San Félix…"
            aria-invalid={Boolean(errors.sectorDestino)}
            {...register("sectorDestino", {
              required: "Indica el sector de destino.",
              setValueAs: (v: string) => v.trim(),
            })}
          />
          {errors.sectorDestino && (
            <p className="text-sm text-destructive">
              {errors.sectorDestino.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="fecha" className="text-sm font-medium">
            Fecha de salida
          </label>
          <input
            id="fecha"
            type="date"
            className={campo}
            aria-invalid={Boolean(errors.fecha)}
            {...register("fecha", { required: "Indica la fecha de salida." })}
          />
          {errors.fecha && (
            <p className="text-sm text-destructive">{errors.fecha.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="descripcion"
          rows={3}
          className={campo}
          {...register("descripcion")}
        />
      </div>

      {conMetas && (
        <fieldset className="flex flex-col gap-3 border-t border-border pt-4">
          <legend className="text-sm font-medium">Metas de recursos</legend>
          <p className="text-sm text-muted-foreground">
            Qué necesita el envío y cuánto, con los recursos activos del catálogo.
          </p>

          {sinRecursos ? (
            <p className="text-sm text-destructive">
              No hay recursos activos en el catálogo. Crea alguno antes de definir
              metas.
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
                        htmlFor={`meta-recurso-${index}`}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Recurso
                      </label>
                      <select
                        id={`meta-recurso-${index}`}
                        className={campo}
                        {...register(`metas.${index}.recursoId`, {
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

                    <div className="flex w-32 flex-col gap-1.5">
                      <label
                        htmlFor={`meta-cantidad-${index}`}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Objetivo
                      </label>
                      <input
                        id={`meta-cantidad-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${campo} numeric-tnum`}
                        aria-invalid={Boolean(errors.metas?.[index]?.cantidadObjetivo)}
                        {...register(`metas.${index}.cantidadObjetivo`, {
                          required: "Indica la cantidad.",
                          valueAsNumber: true,
                          validate: (v) =>
                            (Number.isFinite(v) && v > 0) ||
                            "Debe ser mayor que cero.",
                        })}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Quitar meta"
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
                      cantidadObjetivo: 1,
                    })
                  }
                >
                  Añadir meta
                </Button>
              </div>
            </>
          )}
        </fieldset>
      )}

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <Button type="submit" disabled={pendiente || sinRecursos}>
        {pendiente ? textoEnviandoDinamico : textoEnviarDinamico}
      </Button>
    </form>
  );
}
