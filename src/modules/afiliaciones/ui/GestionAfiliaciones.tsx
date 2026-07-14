"use client";

import { useMemo, useState, useTransition } from "react";
import { Building2, ChevronDown, MapPin, Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import type { CentroConAfiliacion } from "@/modules/afiliaciones/application/consultarRed";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type Accion = (adminId: string) => Promise<{ ok: boolean; error?: string }>;

type Props = {
  centros: CentroConAfiliacion[];
  afiliarseAction: Accion;
  dejarCentroAction: Accion;
};

const TODOS = "__todos__";

// Descubrimiento y gestión de afiliaciones del COLABORADOR (feature 025). Lista los
// centros verificados, filtrables por estado, expandibles a sus puntos activos, con
// acción de afiliarse o dejar cada uno.
export function GestionAfiliaciones({
  centros,
  afiliarseAction,
  dejarCentroAction,
}: Props) {
  const [filtroEstado, setFiltroEstado] = useState<string>(TODOS);
  const [busqueda, setBusqueda] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const [centroPendiente, setCentroPendiente] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const estados = useMemo(() => {
    const nombres = new Set<string>();
    for (const c of centros) {
      if (c.estadoNombre) nombres.add(c.estadoNombre);
    }
    return [...nombres].sort();
  }, [centros]);

  const visibles = useMemo(
    () =>
      centros.filter((c) => {
        const coincideEstado = filtroEstado === TODOS || c.estadoNombre === filtroEstado;
        const texto = `${c.nombreCuenta} ${c.municipioNombre ?? ""} ${c.estadoNombre ?? ""}`.toLowerCase();
        return coincideEstado && texto.includes(busqueda.trim().toLowerCase());
      }),
    [busqueda, centros, filtroEstado],
  );

  function ejecutar(accion: Accion, adminId: string) {
    setError(null);
    setCentroPendiente(adminId);
    startTransition(async () => {
      const resultado = await accion(adminId);
      if (!resultado.ok) {
        setError(resultado.error ?? "No se pudo completar la acción.");
      }
      setCentroPendiente(null);
    });
  }

  if (centros.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay centros de acopio verificados disponibles.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_13rem]">
        <label className="relative">
          <span className="sr-only">Buscar centros</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar centro o municipio" className="pl-9" />
        </label>
        {estados.length > 1 && (
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger aria-label="Filtrar por estado" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los estados</SelectItem>
              {estados.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span><strong className="text-foreground">{centros.filter((c) => c.yaAfiliado).length}</strong> afiliados</span>
        <span><strong className="text-foreground">{visibles.length}</strong> centros visibles</span>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <ul className="divide-y overflow-hidden rounded-lg border bg-card">
        {visibles.length === 0 && (
          <li className="p-8 text-center text-sm text-muted-foreground">
            Ningún centro coincide con la búsqueda o el estado seleccionado.
          </li>
        )}
        {visibles.map((centro) => {
          const abierto = expandido === centro.adminId;
          const ubicacion = [centro.municipioNombre, centro.estadoNombre]
            .filter(Boolean)
            .join(", ");
          return (
            <li
              key={centro.adminId}
              className="flex flex-col gap-3 p-4 transition-colors duration-150 hover:bg-muted/35"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <span className="profile-icon size-9"><Building2 aria-hidden="true" /></span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">{centro.nombreCuenta}</span>
                  {ubicacion && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />{ubicacion}
                    </span>
                  )}
                  </div>
                </div>
                {centro.yaAfiliado ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={pendiente && centroPendiente === centro.adminId}
                    onClick={() => ejecutar(dejarCentroAction, centro.adminId)}
                  >
                    {pendiente && centroPendiente === centro.adminId ? "Actualizando…" : "Dejar afiliación"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={pendiente && centroPendiente === centro.adminId}
                    onClick={() =>
                      ejecutar(afiliarseAction, centro.adminId)
                    }
                  >
                    {pendiente && centroPendiente === centro.adminId ? "Afiliando…" : "Afiliarme"}
                  </Button>
                )}
              </div>

              {centro.puntos.length > 0 && (
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() =>
                      setExpandido(abierto ? null : centro.adminId)
                    }
                    aria-expanded={abierto}
                  >
                    <ChevronDown
                      strokeWidth={1.5}
                      className={`transition-transform duration-150 ${abierto ? "rotate-180" : ""}`}
                    />
                    {abierto ? "Ocultar" : "Ver"} centros de acopio (
                    {centro.puntos.length})
                  </button>
                  {abierto && (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {centro.puntos.map((p) => (
                        <li key={p.id} className="rounded-md bg-muted/55 p-3 text-sm">
                          <span className="block font-medium">{p.nombre}</span>
                          <span className="mt-0.5 block text-muted-foreground">{p.referencia}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
