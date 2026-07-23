import { Package, Truck, Users, Wallet, type LucideIcon } from "lucide-react";
import {
  CATEGORIAS_RECURSO,
  CategoriaRecurso,
} from "@/modules/recursos/domain/CategoriaRecurso";
import type { RecolectadoRecursoResumen } from "@/modules/transparencia/application/obtener-resumen-publico";

type Props = {
  filas: RecolectadoRecursoResumen[];
};

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

const PRESENTACION: Record<
  CategoriaRecurso,
  { etiqueta: string; icono: LucideIcon }
> = {
  [CategoriaRecurso.SUMINISTRO]: { etiqueta: "Suministros", icono: Package },
  [CategoriaRecurso.TRANSPORTE]: { etiqueta: "Transporte", icono: Truck },
  [CategoriaRecurso.PERSONAL]: { etiqueta: "Personal", icono: Users },
  [CategoriaRecurso.MONETARIO]: { etiqueta: "Aporte monetario", icono: Wallet },
};

// Recolectado por recurso, agrupado por categoría (suministros, transporte, personal,
// monetario). No se comparan cantidades entre recursos porque tienen unidades distintas
// (litros vs. cajas vs. personas): cada recurso muestra su total confirmado sin barras que
// induzcan una comparación falsa. Solo aportes confirmados.
export function RecolectadoPorRecurso({ filas }: Props) {
  const grupos = CATEGORIAS_RECURSO.map((categoria) => ({
    categoria,
    filas: filas.filter((f) => f.categoria === categoria),
  })).filter((g) => g.filas.length > 0);

  return (
    <section aria-labelledby="titulo-recolectado" className="flex flex-col gap-6">
      <div>
        <h2
          id="titulo-recolectado"
          className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl"
        >
          Recolectado por recurso
        </h2>
        <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground [text-wrap:pretty] md:text-base">
          Solo aportes confirmados por el equipo. Los montos en dinero se reciben
          por canales externos; aquí solo se registran para transparencia.
        </p>
      </div>

      {grupos.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          Aún no hay aportes confirmados publicados.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {grupos.map(({ categoria, filas: grupoFilas }) => {
            const { etiqueta, icono: Icono } = PRESENTACION[categoria];
            return (
              <div
                key={categoria}
                className="flex flex-col rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary-ink">
                    <Icono className="size-[18px]" strokeWidth={1.5} aria-hidden />
                  </span>
                  <h3 className="text-sm font-medium text-foreground">
                    {etiqueta}
                  </h3>
                  <span className="numeric-tnum ml-auto font-mono text-xs text-muted-foreground">
                    {grupoFilas.length}{" "}
                    {grupoFilas.length === 1 ? "recurso" : "recursos"}
                  </span>
                </div>
                <ul className="divide-y divide-border/70">
                  {grupoFilas.map((fila) => (
                    <li
                      key={`${fila.recurso}-${fila.unidad}`}
                      className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {fila.recurso}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {categoria === CategoriaRecurso.MONETARIO
                            ? `Canal externo · ${fila.unidad}`
                            : `Unidad: ${fila.unidad}`}
                        </p>
                      </div>
                      <p className="numeric-tnum font-mono text-lg text-primary-ink">
                        {formatearNumero(fila.cantidadRecibida)}{" "}
                        <span className="text-sm text-muted-foreground">
                          {fila.unidad}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
