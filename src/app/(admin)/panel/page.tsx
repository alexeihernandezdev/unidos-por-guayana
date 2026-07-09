import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { EstadoAporteBadge } from "@/modules/aportes/ui/EstadoAporteBadge";
import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { ESTADO_LABEL as ESTADO_AYUDA_LABEL } from "@/modules/ayudas/ui/estados";
import { formatearFecha } from "@/modules/ayudas/ui/fechas";
import { EstadoSolicitud } from "@/modules/solicitudes/domain/EstadoSolicitud";
import { UrgenciaSolicitud } from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import { UrgenciaBadge } from "@/modules/solicitudes/ui/UrgenciaBadge";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { DispatchStrip } from "@/modules/admin/ui";
import {
  listarAportesRecientesServicio,
  progresoDeAyudaServicio,
} from "@/shared/aportes";
import { listarAyudasServicio } from "@/shared/ayudas";
import { listarSolicitudesServicio } from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import { cn } from "@/shared/lib/utils";

// El layout (admin) ya garantiza rol ADMIN; repetimos aquí como defensa en
// profundidad (patrón consistente con el resto de páginas del panel).
export default async function PanelPage() {
  await requireRol(Rol.ADMIN);

  // Todas las consultas van en paralelo: es una vista de solo lectura y
  // ninguna depende de otra.
  const [ayudas, solicitudesAbiertas, aportesRecientes] = await Promise.all([
    listarAyudasServicio(),
    listarSolicitudesServicio({ estado: EstadoSolicitud.ABIERTA }),
    listarAportesRecientesServicio(8),
  ]);

  // Contadores por estado del envío. Se computa a partir del listado completo
  // (no ejecutamos 4 queries filtradas).
  const conteos = contarPorEstado(ayudas);
  const totalEnvios = ayudas.length;

  // Envíos que necesitan atención: los que siguen en RECOLECTANDO, ordenados
  // por fecha de salida ascendente (los más próximos primero).
  const enviosAtencion = ayudas
    .filter((a) => a.estado === EstadoAyuda.RECOLECTANDO)
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .slice(0, 5);

  // Progreso por envío en RECOLECTANDO (evitamos progresoDeAyuda para los ya
  // avanzados: ese detalle vive en /panel/ayudas/[id]).
  const progresosPorAyuda = await Promise.all(
    enviosAtencion.map(async (a) => ({
      ayuda: a,
      progreso: await progresoDeAyudaServicio(a.id),
    })),
  );

  const solicitudesUrgentes = solicitudesAbiertas
    .filter((s) => s.urgencia === UrgenciaSolicitud.ALTA)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, 5);

  // Resumen para el DispatchStrip: dos hechos accionables o silencio.
  const resumen = construirResumen(conteos, solicitudesUrgentes.length);

  return (
    <>
      <DispatchStrip resumen={resumen} />

      <div className="flex flex-col gap-8 p-6 md:p-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl leading-tight tracking-tight text-foreground">
            Sala de despacho
          </h1>
          <p className="max-w-[65ch] text-sm text-foreground/70">
            Estado agregado de envíos, solicitudes y aportes. Priorizado por lo
            que probablemente necesita tu atención en los próximos minutos.
          </p>
        </header>

        {/* Barra segmentada de estados. Los anchos son proporcionales al
            conteo: la información visual coincide con la de datos. */}
        <section
          aria-labelledby="titulo-envios-estado"
          className="flex flex-col gap-3"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2
              id="titulo-envios-estado"
              className="font-serif text-lg leading-none tracking-tight"
            >
              Envíos por estado
            </h2>
            <Link
              href="/panel/ayudas"
              className="focus-ring group inline-flex items-center gap-1 text-sm text-foreground/70 transition-colors duration-150 hover:text-accent"
            >
              Ver todos
              <ArrowRightIcon
                strokeWidth={1.5}
                className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <SegmentedEstados conteos={conteos} total={totalEnvios} />
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Envíos que necesitan atención (2 columnas de 3 en desktop). */}
          <section
            aria-labelledby="titulo-atencion"
            className="flex flex-col gap-3 lg:col-span-2"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id="titulo-atencion"
                className="font-serif text-lg leading-none tracking-tight"
              >
                Envíos que necesitan atención
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                próximos a salir
              </span>
            </div>
            {enviosAtencion.length === 0 ? (
              <VacioBloque mensaje="No hay envíos en Recolectando." />
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {progresosPorAyuda.map(({ ayuda, progreso }) => {
                  const cumplidas = progreso.filter(
                    (p) => p.porcentaje >= 100,
                  ).length;
                  const total = progreso.length;
                  const promedio =
                    total === 0
                      ? 0
                      : Math.min(
                          100,
                          progreso.reduce(
                            (acc, p) => acc + Math.min(100, p.porcentaje),
                            0,
                          ) / total,
                        );
                  return (
                    <li key={ayuda.id}>
                      <Link
                        href={`/panel/ayudas/${ayuda.id}`}
                        className="focus-ring group flex flex-col gap-2 px-4 py-3 transition-colors duration-150 hover:bg-muted/40"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-serif text-base text-foreground">
                            {ayuda.sectorDestino}
                          </span>
                          <span className="numeric-tnum font-mono text-xs text-foreground/70">
                            {formatearFecha(ayuda.fecha)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                            aria-hidden
                          >
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${promedio}%` }}
                            />
                          </div>
                          <span className="numeric-tnum font-mono text-xs text-foreground/70">
                            {cumplidas}/{total} metas
                          </span>
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                          {ayuda.titulo}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Columna derecha: dos secciones apiladas. */}
          <div className="flex flex-col gap-6">
            <section
              aria-labelledby="titulo-urgentes"
              className="flex flex-col gap-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2
                  id="titulo-urgentes"
                  className="font-serif text-lg leading-none tracking-tight"
                >
                  Solicitudes urgentes
                </h2>
                <Link
                  href="/panel/solicitudes"
                  className="focus-ring text-xs text-foreground/70 transition-colors duration-150 hover:text-accent"
                >
                  Ver todas
                </Link>
              </div>
              {solicitudesUrgentes.length === 0 ? (
                <VacioBloque mensaje="Sin solicitudes ALTA abiertas." />
              ) : (
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {solicitudesUrgentes.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/panel/solicitudes/${s.id}`}
                        className="focus-ring flex flex-col gap-1 px-4 py-3 transition-colors duration-150 hover:bg-muted/40"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-serif text-sm text-foreground">
                            {s.sector}
                          </span>
                          <UrgenciaBadge urgencia={s.urgencia} />
                        </div>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {s.descripcion}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              aria-labelledby="titulo-aportes"
              className="flex flex-col gap-3"
            >
              <h2
                id="titulo-aportes"
                className="font-serif text-lg leading-none tracking-tight"
              >
                Aportes recientes
              </h2>
              {aportesRecientes.length === 0 ? (
                <VacioBloque mensaje="Todavía no hay aportes." />
              ) : (
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {aportesRecientes.map((ap) => (
                    <li
                      key={ap.id}
                      className="flex flex-col gap-1 px-4 py-3 text-xs"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-foreground/85">
                          {ap.colaborador?.nombre ?? "colaborador"}
                        </span>
                        <EstadoAporteBadge estado={ap.estado} />
                      </div>
                      <div className="flex items-baseline justify-between gap-2 text-muted-foreground">
                        <span className="truncate">
                          {ap.recurso?.nombre ?? "recurso"}
                        </span>
                        <span
                          className={cn(
                            "numeric-tnum font-mono",
                            ap.estado === EstadoAporte.RECIBIDO
                              ? "text-accent"
                              : "text-foreground/70",
                          )}
                        >
                          {ap.cantidad} {ap.recurso?.unidad ?? ""}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Auxiliares ────────────────────────────────────────────────────────────

type ConteosEnvio = Record<EstadoAyuda, number>;

function contarPorEstado(ayudas: Ayuda[]): ConteosEnvio {
  const base: ConteosEnvio = {
    [EstadoAyuda.RECOLECTANDO]: 0,
    [EstadoAyuda.LISTO]: 0,
    [EstadoAyuda.EN_TRANSITO]: 0,
    [EstadoAyuda.ENTREGADO]: 0,
  };
  for (const a of ayudas) base[a.estado]++;
  return base;
}

function construirResumen(
  conteos: ConteosEnvio,
  urgentes: number,
): string | undefined {
  const partes: string[] = [];
  const rec = conteos[EstadoAyuda.RECOLECTANDO];
  const listo = conteos[EstadoAyuda.LISTO];
  if (rec > 0) partes.push(`${rec} por preparar`);
  if (listo > 0) partes.push(`${listo} listos para salir`);
  if (urgentes > 0) partes.push(`${urgentes} solicitudes urgentes`);
  return partes.length > 0 ? partes.join(", ") : undefined;
}

// Colores discreto por estado (respeta la disciplina: ocre para identidad
// "en preparación", teal para acción "en tránsito", neutrales para el resto).
const ESTADO_COLOR: Record<EstadoAyuda, string> = {
  [EstadoAyuda.RECOLECTANDO]: "bg-primary",
  [EstadoAyuda.LISTO]: "bg-primary/60",
  [EstadoAyuda.EN_TRANSITO]: "bg-accent",
  [EstadoAyuda.ENTREGADO]: "bg-foreground/40",
};

// Orden fijo de estados en el ciclo de vida.
const ESTADOS_ORDEN: EstadoAyuda[] = [
  EstadoAyuda.RECOLECTANDO,
  EstadoAyuda.LISTO,
  EstadoAyuda.EN_TRANSITO,
  EstadoAyuda.ENTREGADO,
];

function SegmentedEstados({
  conteos,
  total,
}: {
  conteos: ConteosEnvio;
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="rounded-lg border border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Todavía no hay envíos registrados.
      </div>
    );
  }

  const segmentos = ESTADOS_ORDEN.map((estado) => ({
    estado,
    count: conteos[estado],
    label: ESTADO_AYUDA_LABEL[estado],
    color: ESTADO_COLOR[estado],
  }));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-5">
      {/* Rail proporcional. */}
      <div
        role="img"
        aria-label={`${total} envíos: ${segmentos
          .filter((s) => s.count > 0)
          .map((s) => `${s.count} ${s.label}`)
          .join(", ")}`}
        className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        {segmentos.map((s) => {
          const pct = total > 0 ? (s.count / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <span
              key={s.estado}
              className={cn("h-full", s.color)}
              style={{ width: `${pct}%` }}
              aria-hidden
            />
          );
        })}
      </div>

      {/* Leyenda con conteos. */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {segmentos.map((s) => (
          <li key={s.estado} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn("size-1.5 rounded-full", s.color)}
              />
              <span className="text-xs text-foreground/70">{s.label}</span>
            </div>
            <span className="numeric-tnum font-mono text-2xl font-medium text-foreground">
              {s.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VacioBloque({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-xs text-muted-foreground">
      {mensaje}
    </div>
  );
}
