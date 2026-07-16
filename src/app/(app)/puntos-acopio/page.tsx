import type { Metadata } from "next";
import { MapPinned } from "lucide-react";
import type { PuntoAcopioConUbicacion } from "@/modules/acopio/ui/PuntoAcopioCard";
import { PuntosAcopioDirectorio } from "@/modules/acopio/ui/PuntosAcopioDirectorio";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarPuntosActivosServicio } from "@/shared/acopio";
import { requireRol } from "@/shared/auth";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";

export const metadata: Metadata = {
  title: "Centros de Acopio",
};

// Directorio de la red para el colaborador (feature 011): dónde entregar lo
// que aporta. Solo puntos activos; sin datos del admin dueño.
export default async function PuntosAcopioDirectorioPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  await requireRol(Rol.COLABORADOR);

  const { vista } = await searchParams;

  const [puntos, catalogo] = await Promise.all([
    listarPuntosActivosServicio(),
    cargarCatalogoUbicacion(),
  ]);

  const estadoPorId = new Map(catalogo.estados.map((e) => [e.id, e.nombre]));
  const municipioPorId = new Map(
    catalogo.municipios.map((m) => [m.id, m.nombre]),
  );
  const puntosVista: PuntoAcopioConUbicacion[] = puntos.map((punto) => ({
    ...punto,
    estadoNombre: estadoPorId.get(punto.estadoId) ?? "",
    municipioNombre: municipioPorId.get(punto.municipioId) ?? "",
  }));

  return (
    <PanelPage>
      <PanelPageHeader
        animated
        icon={MapPinned}
        eyebrow="Red operativa"
        title="Centros de Acopio"
        description="Las sedes de la red donde puedes entregar tus aportes: mapa, horarios y contacto."
      />

      <PuntosAcopioDirectorio
        puntos={puntosVista}
        estados={catalogo.estados}
        municipios={catalogo.municipios}
        vistaInicial={vista === "mapa" ? "mapa" : "directorio"}
      />
    </PanelPage>
  );
}
