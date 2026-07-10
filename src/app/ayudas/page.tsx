import Link from "next/link";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { EstadoBadge } from "@/modules/ayudas/ui/EstadoBadge";
import { formatearFecha } from "@/modules/ayudas/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarAyudasServicio } from "@/shared/ayudas";
import { requireRol } from "@/shared/auth";

// Listado de envíos abiertos a aportes para el colaborador autenticado. Solo se
// muestran las Ayudas en `RECOLECTANDO`: son las únicas que aceptan aportes
// (decisión de la feature 006). Es el punto de entrada al flujo "Aportar".
export default async function AyudasPublicasPage() {
  await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const ayudas = await listarAyudasServicio({ estado: EstadoAyuda.RECOLECTANDO });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Actividades abiertas</h1>
        <p className="text-sm text-muted-foreground">
          Actividades que están recolectando ahora mismo. Elige una para aportar.
        </p>
      </div>

      {ayudas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ahora mismo no hay actividades recolectando. Vuelve más tarde.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ayudas.map((ayuda) => (
            <li key={ayuda.id}>
              <Link
                href={`/ayudas/${ayuda.id}`}
                className="focus-ring flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent/60"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium">{ayuda.titulo}</span>
                  <EstadoBadge estado={ayuda.estado} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Destino:{" "}
                  <span className="text-foreground">{ayuda.sectorDestino}</span>
                  {" · "}
                  Salida:{" "}
                  <span className="numeric-tnum text-foreground">
                    {formatearFecha(ayuda.fecha)}
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/mis-aportes"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Ver mis aportes
      </Link>
    </main>
  );
}
