"use client";

import { useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  TIPOS_ACTIVIDAD,
  TipoActividad,
} from "@/modules/actividades/domain/TipoActividad";
import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { etiquetaTipo } from "./tipos";

// Opción de recurso para el selector de metas (recursos activos del catálogo).
export type RecursoOpcion = {
  id: string;
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
};

export type MetaValor = {
  recursoId: string;
  cantidadObjetivo: number;
};

// Opción de punto de acopio del propio ADMIN para el selector (feature 024).
export type PuntoAcopioOpcion = {
  id: string;
  nombre: string;
};

export type ActividadFormValores = {
  titulo: string;
  sectorDestino: string;
  // Fecha de salida a nivel de día (yyyy-mm-dd). El servidor la interpreta en UTC.
  fecha: string;
  // Hora de fin opcional (HH:mm) para JORNADA/EVENTO_SOCIAL (feature 024). Vacío = sin hora.
  horaFin: string;
  // Tipo de actividad. Solo se pide en el alta (feature 018): en edición de
  // cabecera es inmutable y el form omite el campo.
  tipo: TipoActividad;
  descripcion: string;
  // Punto de acopio opcional del propio ADMIN (feature 024). "" = ninguno.
  puntoAcopioId: string;
  metas: MetaValor[];
};

// Valor centinela para "sin punto de acopio" en el Select (no admite value="").
const SIN_PUNTO = "__ninguno__";

type Props = {
  // El server action se recibe como prop desde la página (server component), así el
  // formulario no importa la capa `app` y se reutiliza para alta y edición.
  action: (
    input: ActividadFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  // Recursos activos disponibles para las metas. En modo edición de cabecera puede
  // venir vacío (las metas se gestionan aparte con `MetasEditor`).
  recursos: RecursoOpcion[];
  // Puntos de acopio activos del propio ADMIN, para asociar uno (opcional). Vacío
  // oculta el selector.
  puntosAcopio?: PuntoAcopioOpcion[];
  // Conteo de colaboradores VERIFICADOS de la red del admin por categoría de
  // recurso (feature 025). Se muestra al elegir el recurso de una meta.
  conteosPorCategoria?: Record<CategoriaRecurso, number>;
  // Si es `true`, incluye la lista dinámica de metas (alta). Si es `false`, solo
  // edita la cabecera.
  conMetas?: boolean;
  valoresIniciales?: Partial<ActividadFormValores>;
  textoEnviar: string;
  textoEnviando: string;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ActividadForm({
  action,
  recursos,
  puntosAcopio = [],
  conteosPorCategoria,
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
    formState: { errors },
  } = useForm<ActividadFormValores>({
    defaultValues: {
      titulo: valoresIniciales?.titulo ?? "",
      sectorDestino: valoresIniciales?.sectorDestino ?? "",
      fecha: valoresIniciales?.fecha ?? hoyISO(),
      horaFin: valoresIniciales?.horaFin ?? "",
      tipo: valoresIniciales?.tipo ?? TipoActividad.ENVIO,
      descripcion: valoresIniciales?.descripcion ?? "",
      puntoAcopioId: valoresIniciales?.puntoAcopioId ?? "",
      metas:
        valoresIniciales?.metas ??
        (conMetas && recursos[0]
          ? [{ recursoId: recursos[0].id, cantidadObjetivo: 1 }]
          : []),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "metas" });
  // La hora de fin solo aplica a jornadas y eventos sociales (feature 024).
  const tipoActual = useWatch({ control, name: "tipo" });
  const muestraHoraFin = tipoActual !== TipoActividad.ENVIO;
  // En el alta el botón es genérico ("Crear actividad"), sin importar el tipo.
  const textoEnviarDinamico = conMetas ? "Crear actividad" : textoEnviar;
  const textoEnviandoDinamico = conMetas ? "Creando…" : textoEnviando;

  const sinRecursos = conMetas && recursos.length === 0;

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        router.push("/panel/actividades");
      } else {
        setErrorServidor(resultado.error ?? "No se pudo guardar la actividad.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-2xl flex-col gap-4">
      {conMetas && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Tipo de actividad</span>
          <Controller
            control={control}
            name="tipo"
            rules={{ required: "Elige el tipo de actividad." }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-label="Tipo de actividad"
                  aria-invalid={Boolean(errors.tipo)}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ACTIVIDAD.map((t) => (
                    <SelectItem key={t} value={t}>
                      {etiquetaTipo(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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
            required: "Indica un título para la actividad.",
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
            Fecha de inicio
          </label>
          <input
            id="fecha"
            type="date"
            className={campo}
            aria-invalid={Boolean(errors.fecha)}
            {...register("fecha", { required: "Indica la fecha de inicio." })}
          />
          {errors.fecha && (
            <p className="text-sm text-destructive">{errors.fecha.message}</p>
          )}
        </div>

        {muestraHoraFin && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="horaFin" className="text-sm font-medium">
              Hora de fin{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="horaFin"
              type="time"
              className={campo}
              {...register("horaFin")}
            />
          </div>
        )}
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

      {puntosAcopio.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Punto de acopio{" "}
            <span className="text-muted-foreground">(opcional)</span>
          </span>
          <Controller
            control={control}
            name="puntoAcopioId"
            render={({ field }) => (
              <Select
                value={field.value === "" ? SIN_PUNTO : field.value}
                onValueChange={(v) =>
                  field.onChange(v === SIN_PUNTO ? "" : v)
                }
              >
                <SelectTrigger aria-label="Punto de acopio" className="w-full">
                  <SelectValue placeholder="Sin punto de acopio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_PUNTO}>Sin punto de acopio</SelectItem>
                  {puntosAcopio.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-sm text-muted-foreground">
            Dónde se recibe el aporte o se realiza la actividad. Solo tus puntos
            activos.
          </p>
        </div>
      )}

      {conMetas && (
        <fieldset className="flex flex-col gap-3 border-t border-border pt-4">
          <legend className="text-sm font-medium">Crear recurso</legend>
          <p className="text-sm text-muted-foreground">
            Qué necesita la actividad y cuánto, con los recursos activos del catálogo.
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
                      <span className="text-xs font-medium text-muted-foreground">
                        Recurso
                      </span>
                      <Controller
                        control={control}
                        name={`metas.${index}.recursoId`}
                        rules={{ required: "Elige un recurso." }}
                        render={({ field: recursoField }) => {
                          const recursoSel = recursos.find(
                            (r) => r.id === recursoField.value,
                          );
                          const aptos =
                            recursoSel && conteosPorCategoria
                              ? conteosPorCategoria[recursoSel.categoria]
                              : undefined;
                          return (
                            <>
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
                                    <SelectItem
                                      key={recurso.id}
                                      value={recurso.id}
                                    >
                                      {recurso.nombre} ({recurso.unidad})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {aptos !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {aptos === 0
                                    ? "Nadie de tu red declaró poder aportar esto todavía."
                                    : `${aptos} de tu red ${aptos === 1 ? "puede" : "pueden"} aportar esto.`}
                                </span>
                              )}
                            </>
                          );
                        }}
                      />
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
                  Añadir recurso
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
