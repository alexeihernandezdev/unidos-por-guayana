import Link from "next/link";
import {
  esEstadoSolicitud,
  ESTADOS_SOLICITUD,
} from "@/modules/solicitudes/domain/EstadoSolicitud";
import {
  esUrgenciaSolicitud,
  URGENCIAS_SOLICITUD,
} from "@/modules/solicitudes/domain/UrgenciaSolicitud";
import type { FiltroSolicitudes } from "@/modules/solicitudes/domain/SolicitudRepository";
import { SolicitudesTabla } from "@/modules/solicitudes/ui/SolicitudesTabla";
import { ESTADO_LABEL } from "@/modules/solicitudes/ui/estados";
import { URGENCIA_LABEL } from "@/modules/solicitudes/ui/urgencias";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarSolicitudesServicio } from "@/shared/solicitudes";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";

type Props = {
  searchParams: Promise<{
    sector?: string;
    urgencia?: string;
    estado?: string;
  }>;
};

const campo =
  "rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export default async function SolicitudesAdminPage({ searchParams }: Props) {
  await requireRol(Rol.ADMIN);

  const { sector, urgencia, estado } = await searchParams;

  const filtro: FiltroSolicitudes = {};
  if (sector?.trim()) filtro.sector = sector.trim();
  if (urgencia && esUrgenciaSolicitud(urgencia)) filtro.urgencia = urgencia;
  if (estado && esEstadoSolicitud(estado)) filtro.estado = estado;

  const solicitudes = await listarSolicitudesServicio(filtro);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Solicitudes de ayuda
        </h1>
        <p className="text-sm text-muted-foreground">
          Peticiones del terreno: sector, urgencia y recursos necesarios.
        </p>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 border-t border-border pt-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sector" className="text-sm font-medium">
            Sector
          </label>
          <input
            id="sector"
            name="sector"
            defaultValue={filtro.sector ?? ""}
            placeholder="Petare, Upata…"
            className={campo}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="urgencia" className="text-sm font-medium">
            Urgencia
          </label>
          <select
            id="urgencia"
            name="urgencia"
            defaultValue={filtro.urgencia ?? ""}
            className={campo}
          >
            <option value="">Todas</option>
            {URGENCIAS_SOLICITUD.map((u) => (
              <option key={u} value={u}>
                {URGENCIA_LABEL[u]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="estado" className="text-sm font-medium">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={filtro.estado ?? ""}
            className={campo}
          >
            <option value="">Todos</option>
            {ESTADOS_SOLICITUD.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <SolicitudesTabla
        solicitudes={solicitudes}
        baseRuta="/panel/solicitudes"
        mostrarSolicitante
      />

      <Link
        href="/panel"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Volver al panel
      </Link>
    </main>
  );
}
