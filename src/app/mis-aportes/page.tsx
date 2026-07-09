import Link from "next/link";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { EstadoAporteBadge } from "@/modules/aportes/ui/EstadoAporteBadge";
import { formatearFecha } from "@/modules/ayudas/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarAportesDeColaboradorServicio } from "@/shared/aportes";
import { obtenerAyudaServicio } from "@/shared/ayudas";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { cancelarAporteAction } from "@/app/aportes/actions";

const celda = "px-3 py-2 text-sm align-middle";

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

export default async function MisAportesPage() {
  const usuario = await requireRol(Rol.COLABORADOR, Rol.ADMIN);
  const aportes = await listarAportesDeColaboradorServicio(usuario.id);

  // Cargamos las cabeceras de las ayudas asociadas para poder mostrar título/fecha.
  const ayudaIds = Array.from(new Set(aportes.map((a) => a.ayudaId)));
  const ayudasPorId = new Map(
    await Promise.all(
      ayudaIds.map(async (id) => [id, await obtenerAyudaServicio(id)] as const),
    ),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Mis aportes</h1>
        <p className="text-sm text-muted-foreground">
          Aportes que has registrado como colaborador.
        </p>
      </div>

      {aportes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no has registrado ningún aporte.
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <th className={celda}>Envío</th>
                <th className={celda}>Recurso</th>
                <th className={celda}>Cantidad</th>
                <th className={celda}>Estado</th>
                <th className={celda}>Nota</th>
                <th className={celda}></th>
              </tr>
            </thead>
            <tbody>
              {aportes.map((a) => {
                const ayuda = ayudasPorId.get(a.ayudaId);
                const puedeCancelar = a.estado === EstadoAporte.COMPROMETIDO;
                return (
                  <tr
                    key={a.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className={celda}>
                      {ayuda ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{ayuda.titulo}</span>
                          <span className="text-xs text-muted-foreground">
                            {ayuda.sectorDestino}
                            {" · "}
                            <span className="numeric-tnum">
                              {formatearFecha(ayuda.fecha)}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <span>{a.ayudaId}</span>
                      )}
                    </td>
                    <td className={celda}>
                      {a.recurso?.nombre ?? "(recurso)"}
                    </td>
                    <td className={`${celda} numeric-tnum`}>
                      {formatearNumero(a.cantidad)} {a.recurso?.unidad ?? ""}
                    </td>
                    <td className={celda}>
                      <EstadoAporteBadge estado={a.estado} />
                    </td>
                    <td className={`${celda} text-muted-foreground`}>
                      {a.nota ?? ""}
                    </td>
                    <td className={celda}>
                      {puedeCancelar && (
                        <form action={cancelarAporteAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <input
                            type="hidden"
                            name="ayudaId"
                            value={a.ayudaId}
                          />
                          <Button type="submit" variant="ghost" size="sm">
                            Cancelar
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Link
        href="/"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
