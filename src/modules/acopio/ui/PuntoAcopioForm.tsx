"use client";

import { Clock, Mail, MapPin, Phone, Warehouse } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import { SelectorUbicacion } from "@/modules/ubicacion/ui/SelectorUbicacion";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { BuscadorLugar } from "./BuscadorLugar";
import type { CoordenadasMapa } from "./PuntoAcopioMapa";
import { PuntoAcopioMapaLazy } from "./PuntoAcopioMapaLazy";

// Formulario de alta/edición de un punto de acopio (feature 011). Vive dentro
// de un modal (DialogContent); al guardar llama `onExito` (la gestión cierra el
// modal y refresca). El server action llega como prop, igual que en
// `RecursoForm`. Tres bloques con icono: identidad, ubicación (catálogo +
// buscador + mapa), horarios y contacto.

export type PuntoAcopioFormValores = {
  nombre: string;
  referencia: string;
  horarios: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  correo: string;
  estadoId: string;
  municipioId: string;
  latitud: string;
  longitud: string;
};

type Props = {
  action: (
    input: PuntoAcopioFormValores,
  ) => Promise<{ ok: boolean; error?: string }>;
  onExito: () => void;
  valoresIniciales?: Partial<PuntoAcopioFormValores>;
  // Centro del mapa sin marcador: capital del estado del admin, o Venezuela.
  centroInicial: CoordenadasMapa;
  // Zoom cuando no hay marcador: 12 con capital, 6 si el centro es Venezuela.
  zoomInicial?: number;
  estados: Estado[];
  municipios: Municipio[];
  textoEnviar: string;
  textoEnviando: string;
};

function TituloBloque({
  icono: Icono,
  children,
}: {
  icono: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium">
      <span className="flex size-6 items-center justify-center rounded-md bg-muted">
        <Icono strokeWidth={1.5} className="size-3.5 text-primary-ink" aria-hidden="true" />
      </span>
      {children}
    </p>
  );
}

export function PuntoAcopioForm({
  action,
  onExito,
  valoresIniciales,
  centroInicial,
  zoomInicial = 12,
  estados,
  municipios,
  textoEnviar,
  textoEnviando,
}: Props) {
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [vuelo, setVuelo] = useState<CoordenadasMapa | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<PuntoAcopioFormValores>({
    defaultValues: {
      nombre: valoresIniciales?.nombre ?? "",
      referencia: valoresIniciales?.referencia ?? "",
      horarios: valoresIniciales?.horarios ?? "",
      telefono: valoresIniciales?.telefono ?? "",
      telefonoEsWhatsApp: valoresIniciales?.telefonoEsWhatsApp ?? true,
      correo: valoresIniciales?.correo ?? "",
      estadoId: valoresIniciales?.estadoId ?? "",
      municipioId: valoresIniciales?.municipioId ?? "",
      latitud: valoresIniciales?.latitud ?? "",
      longitud: valoresIniciales?.longitud ?? "",
    },
  });

  const latitud = watch("latitud");
  const longitud = watch("longitud");
  const esWhatsApp = watch("telefonoEsWhatsApp");
  const marcador: CoordenadasMapa | null =
    latitud && longitud
      ? { latitud: Number(latitud), longitud: Number(longitud) }
      : null;

  function fijarCoordenadas(coordenadas: CoordenadasMapa) {
    setValue("latitud", coordenadas.latitud.toFixed(6), { shouldValidate: true });
    setValue("longitud", coordenadas.longitud.toFixed(6), { shouldValidate: true });
  }

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    startTransition(async () => {
      const resultado = await action(datos);
      if (resultado.ok) {
        onExito();
      } else {
        setErrorServidor(resultado.error ?? "No se pudo guardar el centro.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Identidad del punto */}
      <div className="flex flex-col gap-4">
        <TituloBloque icono={Warehouse}>Identidad</TituloBloque>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pa-nombre">Nombre del centro</Label>
            <Input
              id="pa-nombre"
              placeholder="Sede centro"
              aria-invalid={Boolean(errors.nombre)}
              {...register("nombre", {
                required: "Indica el nombre del centro.",
                setValueAs: (v: string) => v.trim(),
              })}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pa-referencia">Referencia</Label>
            <Input
              id="pa-referencia"
              placeholder="Casa amarilla frente al abasto"
              aria-invalid={Boolean(errors.referencia)}
              {...register("referencia", {
                required:
                  "Indica una referencia para orientar a quien va a llegar.",
                setValueAs: (v: string) => v.trim(),
              })}
            />
            {errors.referencia && (
              <p className="text-sm text-destructive">
                {errors.referencia.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ubicación: catálogo + buscador + mapa */}
      <div className="flex flex-col gap-4 border-t border-border pt-5">
        <TituloBloque icono={MapPin}>Ubicación</TituloBloque>

        <SelectorUbicacion
          control={control}
          errors={errors}
          estados={estados}
          municipios={municipios}
        />

        <div className="flex flex-col gap-2">
          <BuscadorLugar
            onSeleccion={(lugar) => {
              const destino = { latitud: lugar.latitud, longitud: lugar.longitud };
              fijarCoordenadas(destino);
              setVuelo(destino);
              // Autorellena la referencia solo si sigue vacía: ahorra teclear
              // sin pisar lo escrito.
              if (!getValues("referencia").trim()) {
                setValue("referencia", lugar.nombre, { shouldValidate: true });
              }
            }}
          />
          <div className="h-64 overflow-hidden rounded-lg border">
            <PuntoAcopioMapaLazy
              centro={marcador ?? centroInicial}
              zoom={marcador ? 16 : zoomInicial}
              valor={marcador}
              onCambio={fijarCoordenadas}
              vuelo={vuelo}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {marcador ? (
              <span className="font-mono numeric-tnum text-xs">
                {marcador.latitud.toFixed(6)}, {marcador.longitud.toFixed(6)}
              </span>
            ) : (
              "Haz click en el mapa para marcar la ubicación exacta; luego puedes arrastrar el marcador."
            )}
          </p>
          <input
            type="hidden"
            {...register("latitud", {
              required: "Marca la ubicación del centro en el mapa.",
            })}
          />
          <input type="hidden" {...register("longitud")} />
          {errors.latitud && (
            <p className="text-sm text-destructive">{errors.latitud.message}</p>
          )}
        </div>
      </div>

      {/* Horarios y contacto */}
      <div className="flex flex-col gap-4 border-t border-border pt-5">
        <TituloBloque icono={Clock}>Horarios y contacto</TituloBloque>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pa-horarios">Horarios de atención</Label>
          <Input
            id="pa-horarios"
            placeholder="Lunes a viernes de 9:00 a 17:00"
            aria-invalid={Boolean(errors.horarios)}
            {...register("horarios", {
              required: "Indica los horarios de atención.",
              setValueAs: (v: string) => v.trim(),
            })}
          />
          {errors.horarios && (
            <p className="text-sm text-destructive">{errors.horarios.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pa-telefono">
              <Phone strokeWidth={1.5} className="size-3.5" aria-hidden="true" />
              Teléfono del centro
            </Label>
            <Input
              id="pa-telefono"
              type="tel"
              placeholder="0412 0000000"
              aria-invalid={Boolean(errors.telefono)}
              {...register("telefono", {
                required: "Indica un teléfono de contacto del centro.",
                setValueAs: (v: string) => v.trim(),
              })}
            />
            {errors.telefono && (
              <p className="text-sm text-destructive">
                {errors.telefono.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pa-correo">
              <Mail strokeWidth={1.5} className="size-3.5" aria-hidden="true" />
              Correo
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </Label>
            <Input
              id="pa-correo"
              type="email"
              placeholder="centro@ejemplo.org"
              {...register("correo", { setValueAs: (v: string) => v.trim() })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="pa-whatsapp"
            checked={esWhatsApp}
            onCheckedChange={(v) =>
              setValue("telefonoEsWhatsApp", v === true)
            }
          />
          <Label htmlFor="pa-whatsapp" className="font-normal">
            Este teléfono tiene WhatsApp
          </Label>
        </div>
      </div>

      {errorServidor && (
        <p role="alert" className="text-sm text-destructive">
          {errorServidor}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-5">
        <Button type="submit" disabled={pendiente}>
          {pendiente ? textoEnviando : textoEnviar}
        </Button>
      </div>
    </form>
  );
}
