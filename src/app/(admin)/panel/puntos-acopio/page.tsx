import type { Metadata } from "next";
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Puntos de acopio
        </h1>
        <p className="text-sm text-muted-foreground">
          Las sedes físicas donde recibes entregas: ubicación, horarios y
          contacto.
        </p>
      </div>

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
    </main>
  );
}
