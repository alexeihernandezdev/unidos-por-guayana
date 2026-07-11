import type { Metadata } from "next";
import type { PuntoAcopioConUbicacion } from "@/modules/acopio/ui/PuntoAcopioCard";
import { PuntosAcopioDirectorio } from "@/modules/acopio/ui/PuntosAcopioDirectorio";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarPuntosActivosServicio } from "@/shared/acopio";
import { requireRol } from "@/shared/auth";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";

export const metadata: Metadata = {
  title: "Puntos de acopio",
};

// Directorio de la red para el colaborador (feature 011): dónde entregar lo
// que aporta. Solo puntos activos; sin datos del admin dueño.
export default async function PuntosAcopioDirectorioPage() {
  await requireRol(Rol.COLABORADOR);

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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Puntos de acopio
        </h1>
        <p className="text-sm text-muted-foreground">
          Las sedes de la red donde puedes entregar tus aportes: mapa, horarios
          y contacto.
        </p>
      </div>

      <PuntosAcopioDirectorio
        puntos={puntosVista}
        estados={catalogo.estados}
        municipios={catalogo.municipios}
      />
    </main>
  );
}
