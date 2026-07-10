import type { EnvioResumenPublico } from "@/modules/transparencia/application/obtener-resumen-publico";
import { TarjetaEnvioPublico } from "./TarjetaEnvioPublico";

type Props = {
  envios: EnvioResumenPublico[];
};

export function ListaEnviosPublicos({ envios }: Props) {
  return (
    <section
      aria-labelledby="titulo-envios"
      className="flex flex-col gap-4"
    >
      <div>
        <h2
          id="titulo-envios"
          className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl"
        >
          Actividades y su progreso
        </h2>
        <p className="mt-2 max-w-[58ch] text-sm text-muted-foreground [text-wrap:pretty] md:text-base">
          Envíos, jornadas y eventos sociales con destino visible. El porcentaje
          refleja cuánto de cada meta ya está confirmado.
        </p>
      </div>
      {envios.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
          No hay actividades publicadas todavía.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {envios.map((envio) => (
            <li key={envio.ayudaId}>
              <TarjetaEnvioPublico envio={envio} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
