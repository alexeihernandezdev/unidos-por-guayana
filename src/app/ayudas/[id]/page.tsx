import Link from "next/link";
import { notFound } from "next/navigation";
import { AyudaNoEncontradaError } from "@/modules/ayudas/application/errors";
import { EstadoAyuda } from "@/modules/ayudas/domain/EstadoAyuda";
import { EstadoBadge } from "@/modules/ayudas/ui/EstadoBadge";
import { formatearFecha } from "@/modules/ayudas/ui/fechas";
import { ProgresoMetas } from "@/modules/aportes/ui/ProgresoMetas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { progresoDeAyudaServicio } from "@/shared/aportes";
import { obtenerAyudaServicio } from "@/shared/ayudas";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";

type Props = {
  params: Promise<{ id: string }>;
};

// Detalle del envío para el colaborador autenticado: cabecera, progreso por meta
// (reusa `ProgresoMetas`) y el botón "Aportar" cuando el envío sigue en
// `RECOLECTANDO`. Es la vista pública/autenticada de una Ayuda que pedía la
// feature 006 como origen del flujo de aporte.
export default async function AyudaDetallePublicoPage({ params }: Props) {
  await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const { id } = await params;
  let ayuda;
  try {
    ayuda = await obtenerAyudaServicio(id);
  } catch (error) {
    if (error instanceof AyudaNoEncontradaError) notFound();
    throw error;
  }

  const progreso = await progresoDeAyudaServicio(ayuda.id);
  const aceptaAportes = ayuda.estado === EstadoAyuda.RECOLECTANDO;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {ayuda.titulo}
            </h1>
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
          {ayuda.descripcion && (
            <p className="max-w-[65ch] text-sm text-foreground/80 [text-wrap:pretty]">
              {ayuda.descripcion}
            </p>
          )}
        </div>
        {aceptaAportes && (
          <Button asChild>
            <Link href={`/ayudas/${ayuda.id}/aportar`}>Aportar</Link>
          </Button>
        )}
      </div>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Metas de recursos</h2>
        <ProgresoMetas progreso={progreso} />
        {!aceptaAportes && (
          <p className="text-sm text-muted-foreground">
            Este envío ya no acepta aportes (estado actual: {ayuda.estado}).
          </p>
        )}
      </section>

      <Link
        href="/ayudas"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver a los envíos abiertos
      </Link>
    </main>
  );
}
