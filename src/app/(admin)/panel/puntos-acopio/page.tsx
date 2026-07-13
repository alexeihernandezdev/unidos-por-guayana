import type { Metadata } from "next";
import { MapPinned, UserRound, Warehouse } from "lucide-react";
import {
  PanelPage,
  PanelPageHeader,
  PanelSectionTabs,
} from "@/shared/ui/panel";
import type { PuntoAcopioConUbicacion } from "@/modules/acopio/ui/PuntoAcopioCard";
import { PuntosAcopioGestion } from "@/modules/acopio/ui/PuntosAcopioGestion";
import {
  activarPuntoAcopioAction,
  archivarPuntoAcopioAction,
  crearPuntoAcopioAction,
  editarPuntoAcopioAction,
} from "./actions";
import {
  centroMapaPorDefectoServicio,
  listarPuntosDeAdminServicio,
} from "@/shared/acopio";
import {
  obtenerPerfilAdminGestion,
  requireAdminVerificado,
} from "@/shared/auth";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";

export const metadata: Metadata = {
  title: "Puntos de acopio",
};

// Centro de Venezuela: fallback del mapa cuando el admin no tiene ubicación en
// su perfil (o su estado no tiene capital sembrada).
const CENTRO_VENEZUELA = { latitud: 7.0, longitud: -66.0 };
const ZOOM_VENEZUELA = 6;
const ZOOM_CAPITAL = 12;

export default async function PuntosAcopioPage() {
  const usuario = await requireAdminVerificado();

  const [puntos, catalogo, centroCapital, perfil] = await Promise.all([
    listarPuntosDeAdminServicio(usuario.id),
    cargarCatalogoUbicacion(),
    centroMapaPorDefectoServicio(usuario.id),
    obtenerPerfilAdminGestion(usuario.id),
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

  const centroInicial = centroCapital
    ? { latitud: Number(centroCapital.latitud), longitud: Number(centroCapital.longitud) }
    : CENTRO_VENEZUELA;

  return (
    <PanelPage>
      <PanelPageHeader
        icon={Warehouse}
        eyebrow="Red operativa"
        title="Puntos de acopio"
        description="Administra las sedes físicas donde recibes entregas, sus horarios y canales de contacto."
      />

      <PanelSectionTabs
        ariaLabel="Configuración administrativa"
        activo="/panel/puntos-acopio"
        items={[
          { href: "/panel/perfil", label: "Mi perfil", icon: UserRound },
          {
            href: "/panel/puntos-acopio",
            label: "Puntos de acopio",
            icon: MapPinned,
          },
        ]}
      />

      <PuntosAcopioGestion
        puntos={puntosVista}
        estados={catalogo.estados}
        municipios={catalogo.municipios}
        centroInicial={centroInicial}
        zoomInicial={centroCapital ? ZOOM_CAPITAL : ZOOM_VENEZUELA}
        ubicacionInicial={
          perfil?.estadoId && perfil.municipioId
            ? { estadoId: perfil.estadoId, municipioId: perfil.municipioId }
            : undefined
        }
        crearAction={crearPuntoAcopioAction}
        editarAction={editarPuntoAcopioAction}
        archivarAction={archivarPuntoAcopioAction}
        activarAction={activarPuntoAcopioAction}
      />
    </PanelPage>
  );
}
