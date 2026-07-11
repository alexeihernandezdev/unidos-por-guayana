"use client";

import { useState, useTransition } from "react";
import {
  CATEGORIAS_RECURSO,
  CategoriaRecurso,
} from "@/modules/recursos/domain/CategoriaRecurso";
import { Button } from "@/shared/ui/button";
import { HandHeart, Package, Truck, UsersRound } from "lucide-react";
import { CATEGORIA_LABEL_CORTA } from "./categorias";

type Props = {
  valoresIniciales: CategoriaRecurso[];
  action: (categorias: string[]) => Promise<{ ok: boolean; error?: string }>;
};

// Editor de las categorías de aporte del COLABORADOR (feature 025), para
// `/mi-perfil`. Al menos una es obligatoria.
export function CategoriasEditor({ valoresIniciales, action }: Props) {
  const [seleccion, setSeleccion] = useState<CategoriaRecurso[]>(valoresIniciales);
  const [pendiente, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function alternar(categoria: CategoriaRecurso, marcada: boolean) {
    setSeleccion((actual) =>
      marcada ? [...actual, categoria] : actual.filter((c) => c !== categoria),
    );
  }

  function guardar() {
    setMensaje(null);
    setError(null);
    startTransition(async () => {
      const resultado = await action(seleccion);
      if (resultado.ok) setMensaje("Categorías actualizadas.");
      else setError(resultado.error ?? "No se pudieron guardar las categorías.");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
      {CATEGORIAS_RECURSO.map((categoria, index) => {
        const Icono = [Package, Truck, UsersRound, HandHeart][index] ?? Package;
        const activa = seleccion.includes(categoria);
        return (
        <label key={categoria} className={activa ? "profile-choice is-selected" : "profile-choice"}>
          <input
            type="checkbox"
            className="sr-only"
            checked={activa}
            onChange={(e) => alternar(categoria, e.target.checked)}
          />
          <Icono aria-hidden="true" />
          <span>{CATEGORIA_LABEL_CORTA[categoria]}</span>
          <span className="ml-auto text-xs font-medium">{activa ? "Seleccionado" : "Elegir"}</span>
        </label>
      )})}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {mensaje && <p className="text-sm text-primary-ink">{mensaje}</p>}

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">{seleccion.length} seleccionadas</p>
        <Button
          type="button"
          onClick={guardar}
          disabled={pendiente || seleccion.length === 0}
        >
          {pendiente ? "Guardando…" : "Guardar categorías"}
        </Button>
      </div>
    </div>
  );
}
