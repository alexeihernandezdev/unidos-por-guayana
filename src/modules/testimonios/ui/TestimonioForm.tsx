"use client";

import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { LIMITES_TESTIMONIO } from "../domain/reglas";

export type TestimonioFormValores = {
  titulo: string;
  contenido: string;
  solicitudId: string;
};

type Props = {
  solicitudes: { id: string; sector: string }[];
  valoresIniciales?: Partial<TestimonioFormValores>;
  action: (
    input: TestimonioFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  onExito: () => void;
};

export function TestimonioForm({
  solicitudes,
  valoresIniciales,
  action,
  onExito,
}: Props) {
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TestimonioFormValores>({
    defaultValues: {
      titulo: valoresIniciales?.titulo ?? "",
      contenido: valoresIniciales?.contenido ?? "",
      solicitudId: valoresIniciales?.solicitudId ?? "ninguna",
    },
  });
  const contenido = useWatch({ control, name: "contenido" });

  const enviar = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) onExito();
      else setErrorServidor(resultado.error ?? "No se pudo guardar el testimonio.");
    });
  });

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="testimonio-titulo" className="text-sm font-medium">
          Título
        </label>
        <Input
          id="testimonio-titulo"
          maxLength={LIMITES_TESTIMONIO.TITULO_MAX}
          aria-invalid={Boolean(errors.titulo)}
          {...register("titulo", {
            required: "Escribe un título.",
            minLength: { value: LIMITES_TESTIMONIO.TITULO_MIN, message: "Usa al menos 5 caracteres." },
          })}
        />
        {errors.titulo ? (
          <p className="text-sm text-destructive">{errors.titulo.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="testimonio-contenido" className="text-sm font-medium">
            Tu experiencia
          </label>
          <span className="font-mono text-xs text-muted-foreground numeric-tnum">
            {contenido.length}/{LIMITES_TESTIMONIO.CONTENIDO_MAX}
          </span>
        </div>
        <Textarea
          id="testimonio-contenido"
          rows={7}
          maxLength={LIMITES_TESTIMONIO.CONTENIDO_MAX}
          aria-invalid={Boolean(errors.contenido)}
          placeholder="Cuenta qué ocurrió, cómo te ayudó la red y qué significó para ti."
          {...register("contenido", {
            required: "Escribe tu experiencia.",
            minLength: { value: LIMITES_TESTIMONIO.CONTENIDO_MIN, message: "Usa al menos 40 caracteres." },
          })}
        />
        {errors.contenido ? (
          <p className="text-sm text-destructive">{errors.contenido.message}</p>
        ) : (
          <p className="text-xs leading-5 text-muted-foreground">
            No incluyas teléfonos, cédulas ni otros datos personales.
          </p>
        )}
      </div>

      {solicitudes.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Solicitud relacionada <span className="text-muted-foreground">(opcional)</span>
          </span>
          <Controller
            control={control}
            name="solicitudId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-label="Solicitud relacionada" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Sin solicitud relacionada</SelectItem>
                  {solicitudes.map((solicitud) => (
                    <SelectItem key={solicitud.id} value={solicitud.id}>
                      {solicitud.sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            En público solo se mostrará el sector de la solicitud.
          </p>
        </div>
      ) : null}

      {errorServidor ? (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      ) : null}

      <Button type="submit" disabled={pendiente} className="min-h-11">
        {pendiente ? "Enviando…" : "Enviar a revisión"}
      </Button>
    </form>
  );
}
