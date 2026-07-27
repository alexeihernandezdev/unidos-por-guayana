"use client";

import { useState } from "react";
import {
  BellRing,
  Check,
  CircleAlert,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import type {
  CanalExterno,
  PreferenciaVista,
} from "@/modules/notificaciones/domain";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";

type ResultadoAjuste = { ok: boolean; error?: string };

type Props = {
  iniciales: PreferenciaVista[];
  email: string;
  smtpDisponible: boolean;
  whatsappDisponible: boolean;
  actualizarAction: (input: {
    tipo: string;
    canal: CanalExterno;
    activo: boolean;
  }) => Promise<ResultadoAjuste>;
  probarEmailAction: () => Promise<ResultadoAjuste>;
};

type EstadoCambio = "idle" | "guardando" | "guardado" | "error";

export function AjustesNotificaciones({
  iniciales,
  email,
  smtpDisponible,
  whatsappDisponible,
  actualizarAction,
  probarEmailAction,
}: Props) {
  const [preferencias, setPreferencias] = useState(iniciales);
  const [estados, setEstados] = useState<Record<string, EstadoCambio>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [prueba, setPrueba] = useState<
    "idle" | "enviando" | "enviado" | "error"
  >("idle");
  const [errorPrueba, setErrorPrueba] = useState("");

  async function cambiar(
    tipo: PreferenciaVista["tipo"],
    canal: CanalExterno,
    activo: boolean,
  ) {
    const key = `${tipo}:${canal}`;
    const campo = canal === "EMAIL" ? "emailActivo" : "whatsappActivo";
    const anterior =
      preferencias.find((item) => item.tipo === tipo)?.[campo] ?? true;
    setPreferencias((actuales) =>
      actuales.map((item) =>
        item.tipo === tipo ? { ...item, [campo]: activo } : item,
      ),
    );
    setEstados((actual) => ({ ...actual, [key]: "guardando" }));
    setErrores((actual) => ({ ...actual, [key]: "" }));
    const resultado = await actualizarAction({ tipo, canal, activo });
    if (resultado.ok) {
      setEstados((actual) => ({ ...actual, [key]: "guardado" }));
      return;
    }
    setPreferencias((actuales) =>
      actuales.map((item) =>
        item.tipo === tipo ? { ...item, [campo]: anterior } : item,
      ),
    );
    setEstados((actual) => ({ ...actual, [key]: "error" }));
    setErrores((actual) => ({
      ...actual,
      [key]: resultado.error ?? "No se pudo guardar.",
    }));
  }

  async function probarEmail() {
    setPrueba("enviando");
    setErrorPrueba("");
    const resultado = await probarEmailAction();
    if (resultado.ok) {
      setPrueba("enviado");
    } else {
      setPrueba("error");
      setErrorPrueba(resultado.error ?? "No se pudo enviar el correo.");
    }
  }

  return (
    <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,0.6fr)]">
      <section className="profile-surface panel-rise" aria-labelledby="avisos-title">
        <div className="profile-section-heading">
          <span className="profile-icon">
            <BellRing aria-hidden="true" />
          </span>
          <div>
            <h2 id="avisos-title">Qué quieres recibir</h2>
            <p>La copia dentro de la plataforma siempre permanece activa.</p>
          </div>
        </div>

        {preferencias.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
            <p className="font-medium">No hay avisos configurables para tu rol.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando se añada un evento aplicable, aparecerá aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="divide-y overflow-hidden rounded-lg border bg-card">
            {preferencias.map((preferencia) => (
              <article
                key={preferencia.tipo}
                className="grid gap-5 p-5 lg:grid-cols-[minmax(14rem,1fr)_minmax(28rem,1.2fr)] lg:items-center"
              >
                <div>
                  <h3 className="font-medium">{preferencia.titulo}</h3>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                    {preferencia.descripcion}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <CanalFijo />
                  <CanalToggle
                    icon={Mail}
                    label="Email"
                    checked={preferencia.emailActivo}
                    disponible={smtpDisponible}
                    ayudaNoDisponible="SMTP no configurado"
                    estado={estados[`${preferencia.tipo}:EMAIL`] ?? "idle"}
                    error={errores[`${preferencia.tipo}:EMAIL`]}
                    onCheckedChange={(activo) =>
                      cambiar(preferencia.tipo, "EMAIL", activo)
                    }
                  />
                  <CanalToggle
                    icon={MessageCircle}
                    label="WhatsApp"
                    checked={preferencia.whatsappActivo}
                    disponible={whatsappDisponible}
                    ayudaNoDisponible="Falta un teléfono WhatsApp"
                    estado={estados[`${preferencia.tipo}:WHATSAPP`] ?? "idle"}
                    error={errores[`${preferencia.tipo}:WHATSAPP`]}
                    onCheckedChange={(activo) =>
                      cambiar(preferencia.tipo, "WHATSAPP", activo)
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="profile-surface panel-rise xl:sticky xl:top-8" aria-labelledby="email-title">
        <div className="profile-section-heading">
          <span className="profile-icon">
            <Mail aria-hidden="true" />
          </span>
          <div>
            <h2 id="email-title">Correo electrónico</h2>
            <p>Comprueba el canal que usaremos para enviarte avisos.</p>
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-lg border bg-muted/35 p-4">
            <p className="text-xs font-medium text-muted-foreground">Dirección registrada</p>
            <p className="mt-1 break-all text-sm font-medium">{email || "Sin correo"}</p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            {smtpDisponible ? (
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
            )}
            <div>
              <p className="font-medium">
                {smtpDisponible ? "Servicio disponible" : "Servicio no configurado"}
              </p>
              <p className="mt-0.5 leading-5 text-muted-foreground">
                {smtpDisponible
                  ? "Puedes enviar una prueba a esta dirección."
                  : "Completa las variables SMTP del servidor para activar Email."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="min-h-11 w-full"
            disabled={!smtpDisponible || prueba === "enviando"}
            onClick={probarEmail}
          >
            <Send aria-hidden="true" />
            {prueba === "enviando" ? "Enviando…" : "Enviar correo de prueba"}
          </Button>
          <p
            className={
              prueba === "error"
                ? "text-sm text-destructive"
                : "text-sm text-muted-foreground"
            }
            aria-live="polite"
          >
            {prueba === "enviado"
              ? "Correo enviado. Revisa también la carpeta de spam."
              : prueba === "error"
                ? errorPrueba
                : "La prueba solo se enviará al correo de tu cuenta."}
          </p>
        </div>
      </section>
    </div>
  );
}

function CanalFijo() {
  return (
    <div className="flex min-h-20 items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-3">
      <div className="flex items-center gap-2">
        <BellRing className="size-4 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium">En la app</p>
          <p className="text-xs text-muted-foreground">Siempre activo</p>
        </div>
      </div>
      <Check className="size-4 text-primary" aria-hidden="true" />
    </div>
  );
}

function CanalToggle({
  icon: Icon,
  label,
  checked,
  disponible,
  ayudaNoDisponible,
  estado,
  error,
  onCheckedChange,
}: {
  icon: typeof Mail;
  label: string;
  checked: boolean;
  disponible: boolean;
  ayudaNoDisponible: string;
  estado: EstadoCambio;
  error?: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-3 rounded-lg border bg-background px-3 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-muted-foreground" aria-live="polite">
            {!disponible
              ? ayudaNoDisponible
              : estado === "guardando"
                ? "Guardando…"
                : estado === "guardado"
                  ? "Guardado"
                  : estado === "error"
                    ? error
                    : checked
                      ? "Activo"
                      : "Desactivado"}
          </p>
        </div>
      </div>
      <Switch
        aria-label={`${checked ? "Desactivar" : "Activar"} ${label}`}
        checked={checked}
        disabled={!disponible || estado === "guardando"}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
