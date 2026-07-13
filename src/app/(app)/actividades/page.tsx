import Link from "next/link";
import { CalendarDays, MapPin, Truck } from "lucide-react";
import { EstadoActividad } from "@/modules/actividades/domain/EstadoActividad";
import { EstadoBadge } from "@/modules/actividades/ui/EstadoBadge";
import { formatearFecha } from "@/modules/actividades/ui/fechas";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarActividadesServicio } from "@/shared/actividades";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import {
  PanelList,
  PanelListRow,
  PanelPage,
  PanelPageHeader,
} from "@/shared/ui/panel";

// Listado de envíos abiertos a aportes para el colaborador autenticado. Solo se
// muestran las Actividades en `RECOLECTANDO`: son las únicas que aceptan aportes
// (decisión de la feature 006). Es el punto de entrada al flujo "Aportar".
export default async function ActividadesPublicasPage() {
  await requireRol(Rol.COLABORADOR, Rol.ADMIN);

  const actividades = await listarActividadesServicio({
    estado: EstadoActividad.RECOLECTANDO,
  });

  return (
    <PanelPage>
      <PanelPageHeader
        icon={Truck}
        eyebrow="Colabora"
        title="Actividades abiertas"
        description="Actividades que están recolectando ahora mismo. Elige una para aportar."
        actions={
          <Button asChild variant="outline">
            <Link href="/mis-aportes">Ver mis aportes</Link>
          </Button>
        }
      />

      {actividades.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ahora mismo no hay actividades recolectando. Vuelve más tarde.
        </p>
      ) : (
        <PanelList>
          {actividades.map((ayuda) => (
            <PanelListRow
              key={ayuda.id}
              icon={Truck}
              title={
                <Link
                  href={`/actividades/${ayuda.id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {ayuda.titulo}
                </Link>
              }
              badge={<EstadoBadge estado={ayuda.estado} />}
              meta={[
                { icon: MapPin, texto: ayuda.sectorDestino, label: "Destino" },
                {
                  icon: CalendarDays,
                  label: "Salida",
                  texto: (
                    <span className="numeric-tnum font-mono">
                      {formatearFecha(ayuda.fecha)}
                    </span>
                  ),
                },
              ]}
              actions={
                <Button asChild size="sm">
                  <Link href={`/actividades/${ayuda.id}`}>Ver y aportar</Link>
                </Button>
              }
            />
          ))}
        </PanelList>
      )}
    </PanelPage>
  );
}
