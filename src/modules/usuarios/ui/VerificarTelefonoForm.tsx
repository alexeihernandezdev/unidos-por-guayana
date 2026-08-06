"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageCircle, Phone, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";

type Resultado = { ok: true } | { ok: false; error: string };

type Props = {
  telefonoEnmascarado?: string;
  reenvioEn?: string;
  expiraEn?: string;
  ahoraInicial: string;
  cancelable: boolean;
  enviar: () => Promise<Resultado>;
  reenviar: () => Promise<Resultado>;
  confirmar: (codigo: string) => Promise<Resultado>;
  cancelar: () => Promise<Resultado>;
};

export function VerificarTelefonoForm({
  telefonoEnmascarado,
  reenvioEn,
  expiraEn,
  ahoraInicial,
  cancelable,
  enviar,
  reenviar,
  confirmar,
  cancelar,
}: Props) {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => new Date(ahoraInicial).getTime());
  const [pendiente, startTransition] = useTransition();

  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const segundosReenvio = useMemo(
    () =>
      reenvioEn
        ? Math.max(0, Math.ceil((new Date(reenvioEn).getTime() - ahora) / 1000))
        : 0,
    [ahora, reenvioEn],
  );
  const minutosExpiracion = useMemo(
    () =>
      expiraEn
        ? Math.max(0, Math.ceil((new Date(expiraEn).getTime() - ahora) / 60000))
        : 0,
    [ahora, expiraEn],
  );

  const ejecutar = (
    operacion: () => Promise<Resultado>,
    exito?: string,
  ) => {
    setError(null);
    setMensaje(null);
    startTransition(async () => {
      const resultado = await operacion();
      if (!resultado.ok) setError(resultado.error);
      else {
        if (exito) setMensaje(exito);
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <ol
        className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center"
        aria-label="Progreso de verificación"
      >
        {[
          { icon: Phone, label: "Tu número", activo: true },
          { icon: MessageCircle, label: "WhatsApp", activo: Boolean(telefonoEnmascarado) },
          { icon: Check, label: "Confirmado", activo: false },
        ].map((paso, indice) => (
          <div key={paso.label} className="contents">
            {indice > 0 && <span className="h-px bg-border" aria-hidden />}
            <li className="flex flex-col items-center gap-2">
              <span
                className={`grid size-9 place-items-center rounded-full border ${
                  paso.activo
                    ? "border-primary/40 bg-primary/10 text-primary-ink"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                <paso.icon size={17} strokeWidth={1.5} aria-hidden />
              </span>
              <span className="text-[0.6875rem] font-medium text-muted-foreground">
                {paso.label}
              </span>
            </li>
          </div>
        ))}
      </ol>

      {telefonoEnmascarado ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(evento) => {
            evento.preventDefault();
            ejecutar(() => confirmar(codigo));
          }}
        >
          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Enviamos el código a
            </p>
            <p className="mt-1 font-mono text-sm font-medium tracking-wide text-foreground">
              {telefonoEnmascarado}
            </p>
          </div>

          <div>
            <label htmlFor="codigo-otp" className="text-sm font-medium">
              Código de 6 dígitos
            </label>
            <input
              id="codigo-otp"
              name="codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={codigo}
              onChange={(evento) =>
                setCodigo(evento.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="auth-field mt-2 h-14 w-full text-center font-mono text-xl tracking-[0.5em]"
              aria-describedby="otp-ayuda"
            />
            <p
              id="otp-ayuda"
              className="mt-2 text-xs leading-5 text-muted-foreground"
            >
              {minutosExpiracion > 0
                ? `El código vence en aproximadamente ${minutosExpiracion} min.`
                : "El código puede haber vencido. Solicita uno nuevo."}
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={pendiente || codigo.length !== 6}
          >
            {pendiente ? "Verificando…" : "Confirmar teléfono"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={pendiente || segundosReenvio > 0}
            onClick={() =>
              ejecutar(reenviar, "Enviamos un código nuevo por WhatsApp.")
            }
          >
            <RotateCcw aria-hidden />
            {segundosReenvio > 0
              ? `Reenviar en ${segundosReenvio}s`
              : "Reenviar código"}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Todavía no se ha enviado el código. Confirma que tienes acceso a
            WhatsApp y solicítalo para continuar.
          </p>
          <Button
            size="lg"
            disabled={pendiente}
            onClick={() => ejecutar(enviar, "Código enviado por WhatsApp.")}
          >
            <MessageCircle aria-hidden />
            {pendiente ? "Enviando…" : "Enviar código"}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {mensaje && (
        <p className="text-sm text-primary-ink" role="status" aria-live="polite">
          {mensaje}
        </p>
      )}

      {cancelable && (
        <button
          type="button"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          disabled={pendiente}
          onClick={() => ejecutar(cancelar)}
        >
          Cancelar el cambio y conservar mi número anterior
        </button>
      )}
    </div>
  );
}
