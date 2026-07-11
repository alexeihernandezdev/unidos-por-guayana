import type { MedioDonacion } from "@/modules/donaciones/domain/MedioDonacion";
import { TipoMedioBadge } from "./TipoMedioBadge";

type Props = {
  medios: MedioDonacion[];
  // Título opcional para encajar en distintas superficies (tablero 009, landing).
  titulo?: string;
};

// Lista pública de medios de donación (feature 014). Presentacional: recibe los
// medios ya filtrados (`listarMediosPublicables`) desde la página que la usa
// (tablero 009 o landing). Sin `requireRol`: es contenido abierto. Deja claro que
// el pago ocurre por fuera de la app; aquí solo se muestran los medios.
export function MediosDonacionPublicos({
  medios,
  titulo = "Cómo donar dinero",
}: Props) {
  if (medios.length === 0) return null;

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">{titulo}</h2>
        <p className="text-sm text-muted-foreground">
          El pago se realiza por fuera de la aplicación. Aquí solo mostramos los
          medios disponibles para donar; la app no procesa ningún cobro.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {medios.map((medio) => (
          <li
            key={medio.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <TipoMedioBadge tipo={medio.tipo} />
              <span className="numeric-tnum text-xs font-medium text-muted-foreground">
                {medio.moneda}
              </span>
            </div>
            <span className="font-medium">{medio.titular}</span>
            <span className="text-sm break-words text-muted-foreground">
              {medio.datos}
            </span>
            {medio.nota && (
              <span className="text-xs text-muted-foreground">{medio.nota}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
