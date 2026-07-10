import type { TotalesImpactoPublico } from "@/modules/transparencia/application/obtener-resumen-publico";

type Props = {
  totales: TotalesImpactoPublico;
};

function formatearEntero(n: number): string {
  return new Intl.NumberFormat("es-VE").format(n);
}

export function TotalesImpacto({ totales }: Props) {
  const items = [
    {
      valor: totales.enviosTotal,
      etiqueta: "actividades registradas",
    },
    {
      valor: totales.enviosEntregados,
      etiqueta: "entregadas",
    },
    {
      valor: totales.aportesConfirmados,
      etiqueta: "aportes confirmados",
    },
  ] as const;

  return (
    <section aria-labelledby="titulo-impacto" className="flex flex-col gap-4">
      <h2
        id="titulo-impacto"
        className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl"
      >
        Impacto hasta hoy
      </h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.etiqueta}
            className="rounded-md border border-border bg-card px-5 py-6"
          >
            <p className="numeric-tnum font-mono text-3xl font-medium text-foreground md:text-4xl">
              {formatearEntero(item.valor)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{item.etiqueta}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
