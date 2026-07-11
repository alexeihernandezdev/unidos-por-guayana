import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned, UserRound, Warehouse } from "lucide-react";
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-7 p-5 md:p-8 lg:p-10">
      <header className="rounded-xl bg-primary-ink px-6 py-7 text-primary-foreground md:px-8">
        <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white/10"><Warehouse className="size-5" aria-hidden="true" /></span><div><p className="mb-1 text-sm text-white/70">Red operativa</p><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Puntos de acopio</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Administra las sedes físicas donde recibes entregas, sus horarios y canales de contacto.</p></div></div>
      </header>

      <nav aria-label="Configuración administrativa" className="flex gap-2 overflow-x-auto border-b pb-3">
        <Link href="/panel/perfil" className="profile-section-link"><UserRound />Mi perfil</Link>
        <Link href="/panel/puntos-acopio" className="profile-section-link bg-muted text-foreground"><MapPinned />Puntos de acopio</Link>
      </nav>

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
