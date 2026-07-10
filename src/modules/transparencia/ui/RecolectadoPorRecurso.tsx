import { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { RecolectadoRecursoResumen } from "@/modules/transparencia/application/obtener-resumen-publico";

type Props = {
  filas: RecolectadoRecursoResumen[];
};

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

export function RecolectadoPorRecurso({ filas }: Props) {
  return (
    <section
      aria-labelledby="titulo-recolectado"
      className="flex flex-col gap-4"
    >
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
      {filas.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          Aún no hay aportes confirmados publicados.
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {filas.map((fila) => (
            <li
              key={`${fila.recurso}-${fila.unidad}`}
              className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{fila.recurso}</p>
                {fila.categoria === CategoriaRecurso.MONETARIO ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pago por canal externo · moneda {fila.unidad}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Unidad: {fila.unidad}
                  </p>
                )}
              </div>
              <p className="numeric-tnum font-mono text-base text-foreground">
                {formatearNumero(fila.cantidadRecibida)}{" "}
                <span className="text-sm text-muted-foreground">
                  {fila.unidad}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
