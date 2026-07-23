import Link from "next/link";
import { NuevaSolicitudCliente } from "@/modules/solicitudes/ui/NuevaSolicitudCliente";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarRecursosServicio } from "@/shared/recursos";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { buscarUsuarioPorId, requireRol } from "@/shared/auth";
import { PanelPage, PanelPageSubHeader } from "@/shared/ui/panel";

export default async function NuevaSolicitudPage() {
  const usuario = await requireRol(Rol.SOLICITANTE);

  const [recursosRaw, catalogo, perfil] = await Promise.all([
    listarRecursosServicio({ soloSeleccionables: true }),
    cargarCatalogoUbicacion(),
    buscarUsuarioPorId(usuario.id),
  ]);

  const recursos = recursosRaw.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    unidad: r.unidad,
  }));

  // Pre-llena el selector con la ubicación del perfil del solicitante; el municipio
  // solo si el estado también existe, para no dejar el desplegable incoherente.
  const ubicacionInicial =
    perfil?.estadoId
      ? {
          estadoId: perfil.estadoId,
          municipioId: perfil.municipioId ?? "",
        }
      : undefined;

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

      <NuevaSolicitudCliente
        recursos={recursos}
        estados={catalogo.estados}
        municipios={catalogo.municipios}
        ubicacionInicial={ubicacionInicial}
      />
    </PanelPage>
  );
}
