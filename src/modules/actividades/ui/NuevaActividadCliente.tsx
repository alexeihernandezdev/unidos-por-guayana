"use client";

import { useState } from "react";
import { TipoArchivoActividad } from "@/modules/actividades/domain/ArchivoActividad";
import { crearActividadAction } from "@/app/(admin)/panel/actividades/actions";
import type { NecesidadPendiente } from "@/modules/atenciones/domain/Atencion";
import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
import type { MiembroRedApto } from "@/modules/afiliaciones/application/consultarRed";
import { ActividadForm } from "./ActividadForm";
import type {
  PuntoAcopioOpcion,
  RecursoOpcion,
} from "./ActividadForm";
import { SelectorArchivosNueva } from "./SelectorArchivosNueva";
import { subirArchivoDirecto } from "./subirArchivo";
import type { TipoActividad } from "@/modules/actividades/domain/TipoActividad";

// Orquesta la creación de una actividad CON archivos (feature 033). El binario necesita
// el `id` de la actividad para su ruta en Storage, que no existe hasta crearla; por eso
// el panel de arriba solo recolecta y previsualiza, y aquí subimos DESPUÉS de que
// `crearActividadAction` devuelve el `id`. La imagen y los documentos se muestran como
// una tarjeta encima del formulario; la subida ocurre al pulsar "Crear actividad".

type Props = {
  recursos: RecursoOpcion[];
  puntosAcopio: PuntoAcopioOpcion[];
  conteosPorCategoria: Record<CategoriaRecurso, number>;
  redPorCategoria: Partial<Record<CategoriaRecurso, MiembroRedApto[]>>;
  necesidades: NecesidadPendiente[];
  tipoInicial: TipoActividad;
};

export function NuevaActividadCliente({
  recursos,
  puntosAcopio,
  conteosPorCategoria,
  redPorCategoria,
  necesidades,
  tipoInicial,
}: Props) {
  const [principal, setPrincipal] = useState<File | null>(null);
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [errorArchivos, setErrorArchivos] = useState<string | null>(null);

  // Corre tras crear la actividad, con el `id` ya conocido. No lanza: si algún archivo
  // falla, igual llevamos al detalle (la actividad existe) para reintentar lo que falte.
  async function subirArchivos(id: string | undefined): Promise<string | void> {
    if (!id) return;
    if (!principal && adjuntos.length === 0) return;

    setSubiendo(true);
    try {
      const pendientes: Array<[File, TipoArchivoActividad]> = [];
      if (principal) {
        pendientes.push([principal, TipoArchivoActividad.PRINCIPAL]);
      }
      for (const doc of adjuntos) {
        pendientes.push([doc, TipoArchivoActividad.ADJUNTO]);
      }
      // Secuencial: cada confirmación toca la BD (índice único de PRINCIPAL, conteo de
      // adjuntos), así que evitamos carreras subiéndolos de uno en uno.
      for (const [file, tipo] of pendientes) {
        try {
          await subirArchivoDirecto(id, file, tipo);
        } catch {
          // Un fallo aislado no aborta el resto; el detalle mostrará lo que sí subió.
        }
      }
    } finally {
      setSubiendo(false);
    }
    return `/panel/actividades/${id}`;
  }

  return (
    <div className="flex flex-col gap-8">
      <SelectorArchivosNueva
        principal={principal}
        adjuntos={adjuntos}
        onPrincipalChange={setPrincipal}
        onAdjuntosChange={setAdjuntos}
        subiendo={subiendo}
        error={errorArchivos}
        onError={setErrorArchivos}
      />
      <ActividadForm
        action={crearActividadAction}
        recursos={recursos}
        puntosAcopio={puntosAcopio}
        conteosPorCategoria={conteosPorCategoria}
        redPorCategoria={redPorCategoria}
        necesidades={necesidades}
        conMetas
        valoresIniciales={{ tipo: tipoInicial }}
        textoEnviar="Crear actividad"
        textoEnviando={subiendo ? "Subiendo archivos…" : "Creando…"}
        alExito={subirArchivos}
      />
    </div>
  );
}
