import Link from "next/link";
import { notFound } from "next/navigation";
import { AyudaNoEncontradaError } from "@/modules/ayudas/application/errors";
import type { Ayuda } from "@/modules/ayudas/domain/Ayuda";
import { esEditable } from "@/modules/ayudas/domain/maquinaEstados";
import { AvanzarEstadoBoton } from "@/modules/ayudas/ui/AvanzarEstadoBoton";
import { EstadoBadge } from "@/modules/ayudas/ui/EstadoBadge";
import { formatearFecha } from "@/modules/ayudas/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { obtenerAyudaServicio } from "@/shared/ayudas";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { avanzarEstadoAction } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
};

async function cargarAyuda(id: string): Promise<Ayuda> {
  try {
    return await obtenerAyudaServicio(id);
  } catch (error) {
    if (error instanceof AyudaNoEncontradaError) notFound();
    throw error;
  }
}

const celda = "px-3 py-2 text-sm align-middle";

export default async function AyudaDetallePage({ params }: Props) {
  await requireRol(Rol.ADMIN);

  const { id } = await params;
  const ayuda = await cargarAyuda(id);
  const editable = esEditable(ayuda.estado);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {ayuda.titulo}
            </h1>
            <EstadoBadge estado={ayuda.estado} />
          </div>
          <p className="text-sm text-muted-foreground">
            Destino: <span className="text-foreground">{ayuda.sectorDestino}</span>
            {" · "}
            Salida:{" "}
            <span className="numeric-tnum text-foreground">
              {formatearFecha(ayuda.fecha)}
            </span>
          </p>
          {ayuda.descripcion && (
            <p className="max-w-[65ch] text-sm text-foreground/80 [text-wrap:pretty]">
              {ayuda.descripcion}
            </p>
          )}
        </div>
        {editable && (
          <Button asChild variant="outline">
            <Link href={`/panel/ayudas/${ayuda.id}/editar`}>Editar</Link>
          </Button>
        )}
      </div>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Metas de recursos</h2>
        {ayuda.metas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este envío no tiene metas definidas.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  <th className={celda}>Recurso</th>
                  <th className={celda}>Objetivo</th>
                  <th className={celda}>Progreso</th>
                </tr>
              </thead>
              <tbody>
                {ayuda.metas.map((meta) => (
                  <tr
                    key={meta.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className={celda}>
                      <span className="font-medium">
                        {meta.recurso?.nombre ?? "Recurso"}
                      </span>
                    </td>
                    <td className={`${celda} numeric-tnum`}>
                      {meta.cantidadObjetivo} {meta.recurso?.unidad ?? ""}
                    </td>
                    <td className={`${celda} text-muted-foreground`}>
                      Sin aportes aún
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Estado del envío</h2>
        <p className="text-sm text-muted-foreground">
          El envío avanza en un solo sentido: Recolectando, Listo, En tránsito,
          Entregado.
        </p>
        <AvanzarEstadoBoton
          ayudaId={ayuda.id}
          estado={ayuda.estado}
          avanzarAction={avanzarEstadoAction}
        />
      </section>

      <Link
        href="/panel/ayudas"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a los envíos
      </Link>
    </main>
  );
}
