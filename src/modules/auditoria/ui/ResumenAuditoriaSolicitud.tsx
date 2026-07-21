import { CalendarClock, History, ShieldCheck } from "lucide-react";
import {
  TipoEventoAuditoriaSolicitud,
  type AuditoriaVisible,
} from "@/modules/auditoria/domain";
import { EstadoVerificacionBadge } from "./EstadoVerificacionBadge";

const FECHA = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function ResumenAuditoriaSolicitud({
  auditoria,
  modo,
}: {
  auditoria: AuditoriaVisible;
  modo: "solicitante" | "admin";
}) {
  const eventos =
    modo === "admin"
      ? auditoria.eventos
      : auditoria.eventos.filter(
          (evento) =>
            evento.tipo === TipoEventoAuditoriaSolicitud.DICTAMEN ||
            evento.tipo === TipoEventoAuditoriaSolicitud.REENVIADA,
        );

  return (
    <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary-ink">
            <ShieldCheck className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Validación de la solicitud</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modo === "admin"
                ? "La atención se habilita únicamente después de la verificación."
                : "Este proceso confirma externamente que la solicitud sea real."}
            </p>
          </div>
        </div>
        <EstadoVerificacionBadge estado={auditoria.estado} />
      </div>

      {eventos.length > 0 ? (
        <div className="mt-5 border-t border-border/70 pt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <History className="size-4 text-primary-ink" strokeWidth={1.5} aria-hidden />
            Historial de verificación
          </div>
          <ol className="space-y-3">
            {eventos.map((evento) => (
              <li key={evento.id} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <EstadoVerificacionBadge estado={evento.estadoResultante} />
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground numeric-tnum">
                    <CalendarClock className="size-3.5" strokeWidth={1.5} aria-hidden />
                    {FECHA.format(evento.createdAt)}
                  </span>
                </div>
                {evento.explicacionPublica ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-5 text-foreground/80">
                    {evento.explicacionPublica}
                  </p>
                ) : null}
                {modo === "admin" && evento.metodo ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Método: {evento.metodo}
                  </p>
                ) : null}
                {modo === "admin" && evento.referenciaExterna ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Referencia: {evento.referenciaExterna}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
