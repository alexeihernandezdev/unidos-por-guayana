"use client";

import { useState } from "react";
import { TipoArchivoSolicitud } from "@/modules/solicitudes/domain/ArchivoSolicitud";
import { crearSolicitudAction } from "@/app/(app)/solicitudes/actions";
import type { RecursoOpcion } from "./SolicitudForm";
import { SolicitudForm } from "./SolicitudForm";
import { SelectorArchivosNueva } from "./SelectorArchivosNueva";
import { subirArchivoDirecto } from "./subirArchivo";

// Orquesta la creación de una solicitud CON archivos (feature 031, extensión). El binario
// necesita el `id` de la solicitud para su ruta en Storage, que no existe hasta crearla;
// por eso el panel derecho solo recolecta y previsualiza, y aquí subimos DESPUÉS de que
// `crearSolicitudAction` devuelve el `id`. Layout de dos columnas: formulario a la
// izquierda, archivos a la derecha (se apilan en móvil).

type Props = {
  recursos: RecursoOpcion[];
};

export function NuevaSolicitudCliente({ recursos }: Props) {
  const [principal, setPrincipal] = useState<File | null>(null);
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [errorArchivos, setErrorArchivos] = useState<string | null>(null);

  // Corre tras crear la solicitud, con el `id` ya conocido. No lanza: si algún archivo
  // falla, igual llevamos al detalle (la solicitud existe) para confirmar lo subido.
  async function subirArchivos(id: string | undefined): Promise<string | void> {
    if (!id) return;
    if (!principal && adjuntos.length === 0) return;

    setSubiendo(true);
    try {
      const pendientes: Array<[File, TipoArchivoSolicitud]> = [];
      if (principal) pendientes.push([principal, TipoArchivoSolicitud.PRINCIPAL]);
      for (const doc of adjuntos) {
        pendientes.push([doc, TipoArchivoSolicitud.ADJUNTO]);
      }
      // Secuencial: cada confirmación toca la BD (índice único de PRINCIPAL, conteo de
      // adjuntos), así que evitamos carreras subiéndolos de uno en uno.
      for (const [file, tipo] of pendientes) {
        try {
          await subirArchivoDirecto(id, file, tipo);
        } catch {
          // Un fallo aislado no debe abortar el resto; el detalle mostrará lo que sí subió.
        }
      }
    } finally {
      setSubiendo(false);
    }
    return `/solicitudes/${id}`;
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
      <SolicitudForm
        action={crearSolicitudAction}
        recursos={recursos}
        textoEnviar="Crear solicitud"
        textoEnviando={subiendo ? "Subiendo archivos…" : "Creando…"}
        rutaExito="/solicitudes"
        className="max-w-none"
        alExito={subirArchivos}
      />
      <SelectorArchivosNueva
        principal={principal}
        adjuntos={adjuntos}
        onPrincipalChange={setPrincipal}
        onAdjuntosChange={setAdjuntos}
        subiendo={subiendo}
        error={errorArchivos}
        onError={setErrorArchivos}
      />
    </div>
  );
}
