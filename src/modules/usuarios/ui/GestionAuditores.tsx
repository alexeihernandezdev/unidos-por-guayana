"use client";

import { useActionState } from "react";
import { LoaderCircle, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { useFormStatus } from "react-dom";
import { EstadoVerificacion } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PanelBadge, PanelEmptyState } from "@/shared/ui/panel";

export type CrearAuditorEstado = {
  ok: boolean;
  mensaje: string;
};

type AccionCrear = (
  estado: CrearAuditorEstado,
  formData: FormData,
) => Promise<CrearAuditorEstado>;

type Props = {
  auditores: Usuario[];
  crearAction: AccionCrear;
  suspenderAction: (formData: FormData) => Promise<void>;
  reactivarAction: (formData: FormData) => Promise<void>;
};

const INICIAL: CrearAuditorEstado = { ok: false, mensaje: "" };

function BotonCrear() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="h-11">
      {pending ? (
        <LoaderCircle className="animate-spin" strokeWidth={1.5} aria-hidden />
      ) : (
        <UserPlus strokeWidth={1.5} aria-hidden />
      )}
      {pending ? "Creando" : "Crear auditor"}
    </Button>
  );
}

function BotonEstadoAuditor({ activo }: { activo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin" strokeWidth={1.5} aria-hidden />
      ) : null}
      {pending ? "Guardando" : activo ? "Suspender" : "Reactivar"}
    </Button>
  );
}

export function GestionAuditores({
  auditores,
  crearAction,
  suspenderAction,
  reactivarAction,
}: Props) {
  const [estado, action] = useActionState(crearAction, INICIAL);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
      <section className="h-fit rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-ink">
            <UserPlus className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Nueva cuenta auditora</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              La cuenta queda activa de inmediato y no puede registrarse por la vía pública.
            </p>
          </div>
        </div>

        <form action={action} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="auditor-nombre" className="text-sm font-medium">
              Nombre completo
            </label>
            <Input id="auditor-nombre" name="nombre" minLength={2} maxLength={80} required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="auditor-email" className="text-sm font-medium">
              Correo electrónico
            </label>
            <Input id="auditor-email" name="email" type="email" autoComplete="off" required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="auditor-password" className="text-sm font-medium">
              Contraseña temporal
            </label>
            <Input
              id="auditor-password"
              name="password"
              type="password"
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
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
          <BotonCrear />
        </form>
      </section>

      <section aria-labelledby="auditores-activos" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="auditores-activos" className="text-xl font-semibold tracking-tight">
              Equipo de auditoría
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Suspende el acceso sin eliminar el historial de decisiones.
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground numeric-tnum">
            {auditores.length} en total
          </span>
        </div>

        {auditores.length === 0 ? (
          <PanelEmptyState
            icon={ShieldCheck}
            title="Aún no hay auditores"
            description="Crea la primera cuenta para comenzar a validar solicitudes."
          />
        ) : (
          <ul className="grid gap-3">
            {auditores.map((auditor) => {
              const activo =
                auditor.estadoVerificacion === EstadoVerificacion.VERIFICADO;
              return (
                <li
                  key={auditor.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                      {activo ? (
                        <ShieldCheck className="size-5" strokeWidth={1.5} aria-hidden />
                      ) : (
                        <ShieldOff className="size-5" strokeWidth={1.5} aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{auditor.nombre}</p>
                      <p className="truncate text-sm text-muted-foreground">{auditor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PanelBadge tone={activo ? "success" : "neutral"}>
                      {activo ? "Activo" : "Suspendido"}
                    </PanelBadge>
                    <form action={activo ? suspenderAction : reactivarAction}>
                      <input type="hidden" name="auditorId" value={auditor.id} />
                      <BotonEstadoAuditor activo={activo} />
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
