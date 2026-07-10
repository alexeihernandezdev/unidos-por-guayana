import Link from "next/link";
import type { ResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import { ListaEnviosPublicos } from "./ListaEnviosPublicos";
import { RecolectadoPorRecurso } from "./RecolectadoPorRecurso";
import { TotalesImpacto } from "./TotalesImpacto";

type Props = {
  resumen: ResumenPublico;
};

export function ResumenTransparencia({ resumen }: Props) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 py-12 md:px-8 md:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Tablero público
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground [text-wrap:balance] md:text-5xl">
          Transparencia de la operación
        </h1>
        <p className="mt-4 max-w-[58ch] text-base text-foreground/85 [text-wrap:pretty] md:text-lg md:leading-relaxed">
          Cualquiera puede ver qué se recolectó, cuánto falta y a dónde va cada
          actividad. Sin iniciar sesión y sin datos personales de quien aporta.
        </p>
      </header>

      <TotalesImpacto totales={resumen.totales} />
      <RecolectadoPorRecurso filas={resumen.recolectadoPorRecurso} />
      <ListaEnviosPublicos envios={resumen.envios} />

      <p className="text-sm text-muted-foreground">
        ¿Quieres participar?{" "}
        <Link
          href="/registro?rol=COLABORADOR"
          className="focus-ring underline-sweep text-accent"
        >
          Regístrate como colaborador
        </Link>
        .
      </p>
    </div>
  );
}
