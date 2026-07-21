"use client";

import { useActionState } from "react";
import { CircleCheck, CircleHelp, CircleX, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { ResultadoAuditoria } from "@/modules/auditoria/domain";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type Props = {
  solicitudId: string;
  action: (
    estado: DictamenEstado,
    formData: FormData,
  ) => Promise<DictamenEstado>;
};

export type DictamenEstado = { ok: boolean; mensaje: string };

const INICIAL: DictamenEstado = { ok: false, mensaje: "" };

function BotonEnviar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="h-11">
      {pending ? (
        <LoaderCircle className="animate-spin" strokeWidth={1.5} aria-hidden />
      ) : null}
      {pending ? "Registrando" : "Emitir dictamen"}
    </Button>
  );
}

export function FormularioDictamenAuditoria({ solicitudId, action }: Props) {
  const [estado, formAction] = useActionState(action, INICIAL);
  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="solicitudId" value={solicitudId} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Resultado</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            {
              value: ResultadoAuditoria.VERIFICADA,
              label: "Verificada",
              Icon: CircleCheck,
            },
            {
              value: ResultadoAuditoria.REQUIERE_INFORMACION,
              label: "Requiere información",
              Icon: CircleHelp,
            },
            {
              value: ResultadoAuditoria.NO_VERIFICADA,
              label: "No verificada",
              Icon: CircleX,
            },
          ].map(({ value, label, Icon }) => (
            <label
              key={value}
              className="audit-choice focus-within:ring-[3px] focus-within:ring-ring/40"
            >
              <input
                type="radio"
                name="resultado"
                value={value}
                required
                className="sr-only"
              />
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="metodo" className="text-sm font-medium">
            Método de verificación
          </label>
          <Input
            id="metodo"
            name="metodo"
            minLength={3}
            maxLength={120}
            placeholder="Ej. llamada al centro comunitario"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="referenciaExterna" className="text-sm font-medium">
            Referencia externa <span className="text-muted-foreground">(opcional)</span>
          </label>
          <Input
            id="referenciaExterna"
            name="referenciaExterna"
            maxLength={200}
            placeholder="Código, contacto o URL de referencia"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notaInterna" className="text-sm font-medium">
          Nota interna
        </label>
        <Textarea
          id="notaInterna"
          name="notaInterna"
          minLength={10}
          maxLength={1000}
          rows={4}
          placeholder="Documenta las comprobaciones realizadas. Solo la verá el equipo autorizado."
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="explicacionPublica" className="text-sm font-medium">
          Explicación para el solicitante
        </label>
        <Textarea
          id="explicacionPublica"
          name="explicacionPublica"
          maxLength={500}
          rows={3}
          placeholder="Obligatoria si requiere información o no puede verificarse."
        />
        <p className="text-xs text-muted-foreground">
          No incluyas notas sensibles ni detalles internos de la comprobación.
        </p>
      </div>

      {estado.mensaje ? (
        <p
          className={estado.ok ? "text-sm text-success-ink" : "text-sm text-destructive"}
          role="status"
          aria-live="polite"
        >
          {estado.mensaje}
        </p>
      ) : null}

      <BotonEnviar />
    </form>
  );
}
