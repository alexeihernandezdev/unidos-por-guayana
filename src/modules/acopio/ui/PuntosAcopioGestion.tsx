"use client";

import { Clock3, MapPin, Pencil, Phone, Plus, Warehouse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import { Button } from "@/shared/ui/button";
import {
  PanelBadge,
  PanelEmptyState,
  PanelFormModal,
  PanelList,
  PanelListRow,
  PanelListToolbar,
} from "@/shared/ui/panel";
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
      <PanelListToolbar
        resumen={
          puntos.length === 0
            ? "Aún no tienes puntos registrados."
            : visibles.length === puntos.length
              ? `${puntos.length} ${puntos.length === 1 ? "punto" : "puntos"} en total.`
              : `${visibles.length} de ${puntos.length} puntos.`
        }
      >
        <Button onClick={() => setModal({ modo: "nuevo" })}>
          <Plus strokeWidth={1.5} aria-hidden="true" />
          Nuevo punto
        </Button>
      </PanelListToolbar>

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
        <PanelEmptyState
          icon={Warehouse}
          title="Registra tu primera sede"
          description="Los colaboradores verán dónde entregar sus aportes, con mapa, horarios y contacto."
          action={
            <Button
              onClick={() => setModal({ modo: "nuevo" })}
              variant="outline"
            >
              <Plus strokeWidth={1.5} aria-hidden="true" />
              Nuevo punto
            </Button>
          }
        />
      ) : visibles.length === 0 ? (
        <p className="border-t border-border py-12 text-center text-sm text-muted-foreground">
          Ningún punto coincide con los filtros.
        </p>
      ) : (
        <PanelList>
          {visibles.map((punto) => (
            <PanelListRow
              key={punto.id}
              icon={Warehouse}
              title={punto.nombre}
              badge={
                <PanelBadge tone={punto.activo ? "active" : "neutral"}>
                  {punto.activo ? "Activo" : "Archivado"}
                </PanelBadge>
              }
              secondary={punto.referencia}
              meta={[
                {
                  icon: MapPin,
                  texto: `${punto.municipioNombre}, ${punto.estadoNombre}`,
                  label: "Ubicación",
                },
                { icon: Clock3, texto: punto.horarios, label: "Horarios" },
                { icon: Phone, texto: punto.telefono, label: "Teléfono" },
              ]}
              actions={
                <>
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
                </>
              }
            />
          ))}
        </PanelList>
      )}

      <PanelFormModal
        open={modal !== null}
        onOpenChange={(abierto) => !abierto && setModal(null)}
        size="wide"
        title={
          modal?.modo === "nuevo"
            ? "Nuevo punto de acopio"
            : modal?.modo === "editar"
              ? "Editar punto de acopio"
              : ""
        }
        description={
          modal?.modo === "nuevo"
            ? "Registra una sede física donde recibes entregas."
            : modal?.modo === "editar"
              ? modal.punto.nombre
              : undefined
        }
      >
        {modal?.modo === "nuevo" && (
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
        )}
        {modal?.modo === "editar" && (
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
        )}
      </PanelFormModal>
    </>
  );
}
