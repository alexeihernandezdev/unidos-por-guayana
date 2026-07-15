"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { CATEGORIA_LABEL } from "./categorias";

export type RecursoFormValores = {
  nombre: string;
  unidad: string;
  categoria: CategoriaRecurso;
  descripcion: string;
};

type Props = {
  // El server action se recibe como prop desde la página (server component), así
  // el formulario no importa la capa `app` y se mantiene reutilizable para alta y
  // edición.
  action: (
    input: RecursoFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  onExito?: () => void;
  valoresIniciales?: Partial<RecursoFormValores>;
  textoEnviar: string;
  textoEnviando: string;
};

const CATEGORIAS = Object.values(CategoriaRecurso);

export function RecursoForm({
  action,
  onExito,
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
  } = useForm<RecursoFormValores>({
    defaultValues: {
      nombre: valoresIniciales?.nombre ?? "",
      unidad: valoresIniciales?.unidad ?? "",
      categoria: valoresIniciales?.categoria ?? CategoriaRecurso.SUMINISTRO,
      descripcion: valoresIniciales?.descripcion ?? "",
    },
  });

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        if (onExito) {
          onExito();
        } else {
          router.push("/panel/recursos");
        }
      } else {
        setErrorServidor(resultado.error ?? "No se pudo guardar el recurso.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre
        </label>
        <Input
          id="nombre"
          aria-invalid={Boolean(errors.nombre)}
          {...register("nombre", {
            required: "Indica el nombre del recurso.",
            setValueAs: (v: string) => v.trim(),
            minLength: { value: 1, message: "Indica el nombre del recurso." },
          })}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="unidad" className="text-sm font-medium">
          Unidad de medida
        </label>
        <Input
          id="unidad"
          placeholder="litros, cajas, personas, USD…"
          aria-invalid={Boolean(errors.unidad)}
          {...register("unidad", {
            required: "Indica la unidad de medida.",
            setValueAs: (v: string) => v.trim(),
            minLength: { value: 1, message: "Indica la unidad de medida." },
          })}
        />
        {errors.unidad && (
          <p className="text-sm text-destructive">{errors.unidad.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Categoría</span>
        <Controller
          control={control}
          name="categoria"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-label="Categoría" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {CATEGORIA_LABEL[categoria]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descripcion" className="text-sm font-medium">
          Descripción <span className="text-muted-foreground">(opcional)</span>
        </label>
        <Textarea
          id="descripcion"
          rows={3}
          {...register("descripcion")}
        />
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
