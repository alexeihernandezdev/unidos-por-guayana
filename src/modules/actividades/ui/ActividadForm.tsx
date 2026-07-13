"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ChevronDown,
  Package,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  TIPOS_ACTIVIDAD,
  TipoActividad,
} from "@/modules/actividades/domain/TipoActividad";
import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { MiembroRedApto } from "@/modules/afiliaciones/application/consultarRed";
import { RedAptaLista } from "@/modules/afiliaciones/ui/RedAptaLista";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
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
  // Puntos de acopio propios asignados (0..N, feature 026). Vacío = ninguno.
  puntosAcopioIds: string[];
  metas: MetaValor[];
};

// Presentación del selector de tipo (feature 026): icono y micro-descripción por
// cada tipo. La etiqueta la da `etiquetaTipo` (único punto de verdad, tipos.ts).
const TIPO_INFO: Record<TipoActividad, { icono: LucideIcon; descripcion: string }> = {
  [TipoActividad.ENVIO]: {
    icono: Package,
    descripcion: "Recolectas recursos y los llevas a un sector.",
  },
  [TipoActividad.JORNADA]: {
    icono: CalendarClock,
    descripcion: "Actividad en sitio, con fecha y hora de fin.",
  },
  [TipoActividad.EVENTO_SOCIAL]: {
    icono: Users,
    descripcion: "Encuentro comunitario en un punto.",
  },
};

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
  // Red del admin agrupada por categoría (feature 026): al pulsar "+ info" en una
  // meta se despliega la lista de aptos de la categoría del recurso.
  redPorCategoria?: Partial<Record<CategoriaRecurso, MiembroRedApto[]>>;
  // Si es `true`, incluye la lista dinámica de metas (alta). Si es `false`, solo
  // edita la cabecera.
  conMetas?: boolean;
  valoresIniciales?: Partial<ActividadFormValores>;
  textoEnviar: string;
  textoEnviando: string;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors ease-[var(--ease-out-emil)] focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

// Fila de sección en dos paneles: la etiqueta y su pista a la izquierda, los campos
// a la derecha. En pantallas anchas aprovecha el espacio horizontal (grid 1:3) en
// vez de apilar todo en una columna (feature 026).
function Seccion({
  titulo,
  pista,
  primera,
  children,
}: {
  titulo: string;
  pista?: string;
  primera?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "grid gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]",
        !primera && "border-t border-border pt-8",
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {titulo}
        </h2>
        {pista && (
          <p className="max-w-[38ch] text-xs text-muted-foreground [text-wrap:pretty]">
            {pista}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ActividadForm({
  action,
  recursos,
  puntosAcopio = [],
  conteosPorCategoria,
  redPorCategoria,
  conMetas = false,
  valoresIniciales,
  textoEnviar,
  textoEnviando,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  // Índices de meta cuya lista "+ info" de red está desplegada.
  const [redAbierta, setRedAbierta] = useState<Set<number>>(new Set());

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
      puntosAcopioIds: valoresIniciales?.puntosAcopioIds ?? [],
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
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-8">
      {conMetas && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-semibold tracking-tight text-foreground">
            Tipo de actividad
          </legend>
          <Controller
            control={control}
            name="tipo"
            rules={{ required: "Elige el tipo de actividad." }}
            render={({ field }) => (
              <div
                role="radiogroup"
                aria-label="Tipo de actividad"
                className="grid gap-3 sm:grid-cols-3"
              >
                {TIPOS_ACTIVIDAD.map((t) => {
                  const seleccionado = field.value === t;
                  const { icono: Icono, descripcion } = TIPO_INFO[t];
                  return (
                    <button
                      type="button"
                      key={t}
                      role="radio"
                      aria-checked={seleccionado}
                      onClick={() => field.onChange(t)}
                      className={cn(
                        "focus-ring flex flex-col gap-2.5 rounded-lg border p-4 text-left",
                        "transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-out-emil)]",
                        "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
                        seleccionado
                          ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-foreground/25 hover:bg-muted/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-md border transition-colors duration-200 ease-[var(--ease-out-emil)]",
                          seleccionado
                            ? "border-primary/40 bg-primary/10 text-primary-ink"
                            : "border-border bg-muted text-foreground/70",
                        )}
                      >
                        <Icono className="size-4" strokeWidth={1.5} aria-hidden />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {etiquetaTipo(t)}
                        </span>
                        <span className="text-xs text-muted-foreground [text-wrap:pretty]">
                          {descripcion}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.tipo && (
            <p className="text-sm text-destructive">{errors.tipo.message}</p>
          )}
        </fieldset>
      )}

      <Seccion
        titulo="Detalles"
        pista="Qué es, a dónde va y cuándo."
        primera={!conMetas}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              htmlFor="titulo"
              className="text-sm font-medium text-foreground"
            >
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

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sectorDestino"
              className="text-sm font-medium text-foreground"
            >
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
            <label htmlFor="fecha" className="text-sm font-medium text-foreground">
              Fecha de inicio
            </label>
            <input
              id="fecha"
              type="date"
              className={`${campo} numeric-tnum`}
              aria-invalid={Boolean(errors.fecha)}
              {...register("fecha", { required: "Indica la fecha de inicio." })}
            />
            {errors.fecha && (
              <p className="text-sm text-destructive">{errors.fecha.message}</p>
            )}
          </div>

          {muestraHoraFin && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="horaFin"
                className="text-sm font-medium text-foreground"
              >
                Hora de fin{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </label>
              <input
                id="horaFin"
                type="time"
                className={`${campo} numeric-tnum`}
                {...register("horaFin")}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label
              htmlFor="descripcion"
              className="text-sm font-medium text-foreground"
            >
              Descripción{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id="descripcion"
              rows={3}
              className={campo}
              {...register("descripcion")}
            />
          </div>
        </div>
      </Seccion>

      {puntosAcopio.length > 0 && (
        <Seccion
          titulo="Centros de acopio"
          pista="Dónde se recibe el aporte o se realiza. El colaborador los verá para saber a dónde llevarlo. Opcional, solo tus puntos activos."
        >
          <Controller
            control={control}
            name="puntosAcopioIds"
            render={({ field }) => {
              const seleccion = field.value ?? [];
              const alternar = (id: string, marcado: boolean) => {
                field.onChange(
                  marcado
                    ? [...seleccion, id]
                    : seleccion.filter((x) => x !== id),
                );
              };
              return (
                <div className="grid gap-2 sm:grid-cols-2">
                  {puntosAcopio.map((p) => {
                    const marcado = seleccion.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm",
                          "transition-colors duration-200 ease-[var(--ease-out-emil)]",
                          marcado
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:border-foreground/25 hover:bg-muted/40",
                        )}
                      >
                        <Checkbox
                          checked={marcado}
                          onCheckedChange={(v) => alternar(p.id, v === true)}
                          aria-label={p.nombre}
                        />
                        <span className="text-foreground">{p.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              );
            }}
          />
        </Seccion>
      )}

      {conMetas && (
        <Seccion
          titulo="Qué se necesita"
          pista="Los recursos y cuánto, con el catálogo activo. Puedes ver quién de tu red puede aportar cada uno."
        >
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
                    className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-start"
                  >
                    <div className="flex min-w-0 flex-col gap-1.5">
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
                          const miembros = recursoSel
                            ? (redPorCategoria?.[recursoSel.categoria] ?? [])
                            : [];
                          const abierto = redAbierta.has(index);
                          const alternarInfo = () =>
                            setRedAbierta((prev) => {
                              const siguiente = new Set(prev);
                              if (siguiente.has(index)) siguiente.delete(index);
                              else siguiente.add(index);
                              return siguiente;
                            });
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
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {aptos === 0
                                        ? "Nadie de tu red declaró poder aportar esto todavía."
                                        : `${aptos} de tu red ${aptos === 1 ? "puede" : "pueden"} aportar esto.`}
                                    </span>
                                    {miembros.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={alternarInfo}
                                        aria-expanded={abierto}
                                        className="focus-ring inline-flex items-center gap-1 rounded-md text-xs font-medium text-accent"
                                      >
                                        <Users
                                          className="size-3.5"
                                          strokeWidth={1.5}
                                          aria-hidden
                                        />
                                        {abierto ? "Ocultar" : "+ info"}
                                        <ChevronDown
                                          className={cn(
                                            "size-3.5 transition-transform duration-200 ease-[var(--ease-out-emil)] motion-reduce:transition-none",
                                            abierto && "rotate-180",
                                          )}
                                          strokeWidth={1.5}
                                          aria-hidden
                                        />
                                      </button>
                                    )}
                                  </div>
                                  {abierto && miembros.length > 0 && (
                                    <RedAptaLista miembros={miembros} />
                                  )}
                                </div>
                              )}
                            </>
                          );
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
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
                      className="justify-self-end sm:mt-6"
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
                  <Plus strokeWidth={1.5} />
                  Añadir recurso
                </Button>
              </div>
            </>
          )}
        </Seccion>
      )}

      {errorServidor && (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorServidor}
        </p>
      )}

      <div className="flex border-t border-border pt-6">
        <Button type="submit" disabled={pendiente || sinRecursos}>
          {pendiente ? textoEnviandoDinamico : textoEnviarDinamico}
        </Button>
      </div>
    </form>
  );
}
