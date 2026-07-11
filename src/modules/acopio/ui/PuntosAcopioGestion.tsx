"use client";

import { Clock3, MapPin, Pencil, Phone, Plus, Warehouse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  FILTRO_INICIAL,
  FiltrosPuntos,
  filtrarPuntos,
  type FiltroPuntosValor,
} from "./FiltrosPuntos";
import type { PuntoAcopioConUbicacion } from "./PuntoAcopioCard";
import type { CoordenadasMapa } from "./PuntoAcopioMapa";
import {
  PuntoAcopioForm,
  type PuntoAcopioFormValores,
} from "./PuntoAcopioForm";

// Gestión de puntos de acopio del ADMIN dueño (feature 011): grid de cards +
// modales de alta y edición (sin páginas nuevas). Los server actions llegan
// como props desde la página; al guardar se cierra el modal y
// `router.refresh()` repinta el listado del server component.

type Resultado = { ok: boolean; error?: string };

type Props = {
  puntos: PuntoAcopioConUbicacion[];
  estados: Estado[];
  municipios: Municipio[];
  centroInicial: CoordenadasMapa;
  zoomInicial: number;
  /** Prefill del selector estado→municipio con la ubicación del PerfilAdmin. */
  ubicacionInicial?: { estadoId: string; municipioId: string };
  crearAction: (input: PuntoAcopioFormValores) => Promise<Resultado>;
  editarAction: (
    id: string,
    input: PuntoAcopioFormValores,
  ) => Promise<Resultado>;
  archivarAction: (formData: FormData) => Promise<void>;
  activarAction: (formData: FormData) => Promise<void>;
};

type ModalAbierto =
  | { modo: "nuevo" }
  | { modo: "editar"; punto: PuntoAcopioConUbicacion }
  | null;

export function PuntosAcopioGestion({
  puntos,
  estados,
  municipios,
  centroInicial,
  zoomInicial,
  ubicacionInicial,
  crearAction,
  editarAction,
  archivarAction,
  activarAction,
}: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalAbierto>(null);
  const [filtro, setFiltro] = useState<FiltroPuntosValor>(FILTRO_INICIAL);

  const visibles = filtrarPuntos(puntos, filtro);

  function cerrarYRefrescar() {
    setModal(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {puntos.length === 0
            ? "Aún no tienes puntos registrados."
            : visibles.length === puntos.length
              ? `${puntos.length} ${puntos.length === 1 ? "punto" : "puntos"} en total.`
              : `${visibles.length} de ${puntos.length} puntos.`}
        </p>
        <Button onClick={() => setModal({ modo: "nuevo" })}>
          <Plus strokeWidth={1.5} aria-hidden="true" />
          Nuevo punto
        </Button>
      </div>

      {puntos.length > 0 && (
        <FiltrosPuntos
          valor={filtro}
          onCambio={setFiltro}
          estados={estados}
          municipios={municipios}
          conEstadoActivo
        />
      )}

      {puntos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border-t border-border py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-muted">
            <Warehouse
              strokeWidth={1.5}
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Registra tu primera sede</p>
            <p className="max-w-[38ch] text-sm text-muted-foreground">
              Los colaboradores verán dónde entregar sus aportes, con mapa,
              horarios y contacto.
            </p>
          </div>
          <Button onClick={() => setModal({ modo: "nuevo" })} variant="outline">
            <Plus strokeWidth={1.5} aria-hidden="true" />
            Nuevo punto
          </Button>
        </div>
      ) : visibles.length === 0 ? (
        <p className="border-t border-border py-12 text-center text-sm text-muted-foreground">
          Ningún punto coincide con los filtros.
        </p>
      ) : (
        <div className="divide-y overflow-hidden rounded-lg border bg-card">
          {visibles.map((punto) => (
            <article key={punto.id} className="flex flex-col gap-4 p-4 transition-colors duration-150 hover:bg-muted/30 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="profile-icon size-10"><Warehouse aria-hidden="true" /></span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{punto.nombre}</h2><span className={punto.activo ? "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-ink" : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"}>{punto.activo ? "Activo" : "Archivado"}</span></div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{punto.referencia}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{punto.municipioNombre}, {punto.estadoNombre}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{punto.horarios}</span>
                    <span className="inline-flex items-center gap-1"><Phone className="size-3.5" />{punto.telefono}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 md:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModal({ modo: "editar", punto })}
                  >
                    <Pencil strokeWidth={1.5} aria-hidden="true" />
                    Editar
                  </Button>
                  <form
                    action={punto.activo ? archivarAction : activarAction}
                    className="contents"
                  >
                    <input type="hidden" name="id" value={punto.id} />
                    <Button type="submit" variant="secondary" size="sm">
                      {punto.activo ? "Archivar" : "Activar"}
                    </Button>
                  </form>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={modal !== null}
        onOpenChange={(abierto) => !abierto && setModal(null)}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          {modal?.modo === "nuevo" && (
            <>
              <DialogHeader>
                <DialogTitle>Nuevo punto de acopio</DialogTitle>
                <DialogDescription>
                  Registra una sede física donde recibes entregas.
                </DialogDescription>
              </DialogHeader>
              <PuntoAcopioForm
                action={crearAction}
                onExito={cerrarYRefrescar}
                valoresIniciales={ubicacionInicial}
                centroInicial={centroInicial}
                zoomInicial={zoomInicial}
                estados={estados}
                municipios={municipios}
                textoEnviar="Crear punto"
                textoEnviando="Creando…"
              />
            </>
          )}
          {modal?.modo === "editar" && (
            <>
              <DialogHeader>
                <DialogTitle>Editar punto de acopio</DialogTitle>
                <DialogDescription>{modal.punto.nombre}</DialogDescription>
              </DialogHeader>
              <PuntoAcopioForm
                action={(input) => editarAction(modal.punto.id, input)}
                onExito={cerrarYRefrescar}
                valoresIniciales={{
                  nombre: modal.punto.nombre,
                  referencia: modal.punto.referencia,
                  horarios: modal.punto.horarios,
                  telefono: modal.punto.telefono,
                  telefonoEsWhatsApp: modal.punto.telefonoEsWhatsApp,
                  correo: modal.punto.correo ?? "",
                  estadoId: modal.punto.estadoId,
                  municipioId: modal.punto.municipioId,
                  latitud: modal.punto.latitud,
                  longitud: modal.punto.longitud,
                }}
                centroInicial={centroInicial}
                zoomInicial={zoomInicial}
                estados={estados}
                municipios={municipios}
                textoEnviar="Guardar cambios"
                textoEnviando="Guardando…"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
