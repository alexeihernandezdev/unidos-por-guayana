"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  CATEGORIAS_RECURSO,
  CategoriaRecurso,
} from "@/modules/recursos/domain/CategoriaRecurso";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { CATEGORIA_LABEL } from "./categorias";

export type ProponerRecursoFormValores = {
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string;
};

type Props = {
  action: (
    input: ProponerRecursoFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  rutaExito: string;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function ProponerRecursoForm({ action, rutaExito }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProponerRecursoFormValores>({
    defaultValues: {
      nombre: "",
      unidad: "",
      categoria: CategoriaRecurso.SUMINISTRO,
      descripcion: "",
    },
  });

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    setOk(false);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        setOk(true);
        reset();
        router.refresh();
      } else {
        setErrorServidor(
          resultado.error ?? "No se pudo enviar la propuesta.",
        );
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre del recurso
        </label>
        <input
          id="nombre"
          className={campo}
          placeholder="Ibuprofeno 400mg, mascarillas KN95…"
          aria-invalid={Boolean(errors.nombre)}
          {...register("nombre", {
            required: "Indica el nombre del recurso.",
            setValueAs: (v: string) => v.trim(),
          })}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="unidad" className="text-sm font-medium">
            Unidad
          </label>
          <input
            id="unidad"
            className={campo}
            placeholder="cajas, litros, unidades…"
            aria-invalid={Boolean(errors.unidad)}
            {...register("unidad", {
              required: "Indica la unidad.",
              setValueAs: (v: string) => v.trim(),
            })}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium">Categoría</span>
          <Controller
            control={control}
            name="categoria"
            rules={{ required: "Elige una categoría." }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-label="Categoría" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_RECURSO.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORIA_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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
          placeholder="Qué es y para qué serviría."
          {...register("descripcion")}
        />
      </div>

      {ok && (
        <p className="text-sm text-primary-ink" role="status">
          Propuesta enviada. El equipo la revisará antes de incorporarla al
          catálogo.
        </p>
      )}
      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pendiente}>
          {pendiente ? "Enviando…" : "Enviar propuesta"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(rutaExito)}
        >
          Volver
        </Button>
      </div>
    </form>
  );
}
