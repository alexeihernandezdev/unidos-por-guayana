import Link from "next/link";
import { SolicitudForm } from "@/modules/solicitudes/ui/SolicitudForm";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";
import { crearSolicitudAction } from "../actions";

export default async function NuevaSolicitudPage() {
  await requireRol(Rol.SOLICITANTE);

  const recursos = (
    await listarRecursosServicio({ soloSeleccionables: true })
  ).map(
    (r) => ({
      id: r.id,
      nombre: r.nombre,
      unidad: r.unidad,
    }),
  );

  return (
    <PanelPage>
      <PanelPageSubHeader
        title="Nueva solicitud de ayuda"
        description="Indica tu sector, la urgencia y qué recursos necesitas."
        backHref="/solicitudes"
        backLabel="Volver a mis solicitudes"
      />

      <p className="text-sm text-muted-foreground">
        ¿No ves el recurso que necesitas?{" "}
        <Link
          href="/solicitudes/proponer-recurso"
          className="text-primary underline-offset-4 hover:underline"
        >
          Propón uno nuevo al catálogo
        </Link>
        .
      </p>

      <SolicitudForm
        action={crearSolicitudAction}
        recursos={recursos}
        textoEnviar="Crear solicitud"
        textoEnviando="Creando…"
        rutaExito="/solicitudes"
      />

      <p className="border-t border-border pt-4 text-sm text-muted-foreground">
        Si auditoría necesita información adicional, podrás corregir la solicitud
        y añadir documentos antes de reenviarla.
      </p>
    </PanelPage>
  );
}
