import {
  CalendarDays,
  HandHeart,
  Hash,
  MapPin,
  Package,
  StickyNote,
} from "lucide-react";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import { EstadoAporteBadge } from "@/modules/aportes/ui/EstadoAporteBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarAportesDeColaboradorServicio } from "@/shared/aportes";
import { obtenerActividadServicio } from "@/shared/actividades";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import {
  PanelList,
  PanelListRow,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";
import { cancelarAporteAction } from "@/app/aportes/actions";

function formatearNumero(n: number): string {
  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n);
}

export default async function MisAportesPage() {
  const usuario = await requireRol(Rol.COLABORADOR, Rol.ADMIN);
  const aportes = await listarAportesDeColaboradorServicio(usuario.id);

  // Cargamos las cabeceras de las actividades asociadas para poder mostrar título/fecha.
  const ayudaIds = Array.from(
    new Set(
      aportes
        .map((a) => a.actividadId)
        .filter((id): id is string => id !== null),
    ),
  );
  const ayudasPorId = new Map(
    await Promise.all(
      ayudaIds.map(async (id) => [id, await obtenerActividadServicio(id)] as const),
    ),
  );

  return (
    <PanelPage>
      <PanelPageHeader
        icon={HandHeart}
        eyebrow="Colabora"
        title="Mis aportes"
        description="Aportes que has registrado como colaborador."
      />

      {aportes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no has registrado ningún aporte.
        </p>
      ) : (
        <PanelList>
          {aportes.map((a) => {
            const ayuda = a.actividadId ? ayudasPorId.get(a.actividadId) : null;
            const puedeCancelar = a.estado === EstadoAporte.COMPROMETIDO;
            return (
              <PanelListRow
                key={a.id}
                icon={HandHeart}
                title={ayuda?.titulo ?? a.actividadId ?? "Aporte general"}
                badge={<EstadoAporteBadge estado={a.estado} />}
                meta={[
                  ...(ayuda
                    ? [
                        {
                          icon: MapPin,
                          texto: ayuda.sectorDestino,
                          label: "Destino",
                        },
                        {
                          icon: CalendarDays,
                          label: "Salida",
                          texto: (
                            <span className="numeric-tnum font-mono">
                              {formatearFecha(ayuda.fecha)}
                            </span>
                          ),
                        },
                      ]
                    : []),
                  {
                    icon: Package,
                    texto: a.recurso?.nombre ?? "(recurso)",
                    label: "Recurso",
                  },
                  {
                    icon: Hash,
                    label: "Cantidad",
                    texto: (
                      <span className="numeric-tnum font-mono">
                        {formatearNumero(a.cantidad)} {a.recurso?.unidad ?? ""}
                      </span>
                    ),
                  },
                  ...(a.nota
                    ? [{ icon: StickyNote, texto: a.nota, label: "Nota" }]
                    : []),
                ]}
                actions={
                  puedeCancelar ? (
                    <form action={cancelarAporteAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <input
                        type="hidden"
                        name="actividadId"
                        value={a.actividadId ?? ""}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        Cancelar
                      </Button>
                    </form>
                  ) : undefined
                }
              />
            );
          })}
        </PanelList>
      )}
    </PanelPage>
  );
}
