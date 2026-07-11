"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import type { Estado } from "@/modules/ubicacion/domain/Estado";
import type { Municipio } from "@/modules/ubicacion/domain/Municipio";
import { SelectorUbicacion } from "@/modules/ubicacion/ui/SelectorUbicacion";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import {
  TipoDocumento,
  type DatosPerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { DatosContactoFields } from "./DatosContactoFields";
import { PasswordInput } from "./PasswordInput";

// Payload que el formulario envía al server action. Cuando el rol es ADMIN,
// incluye el perfil de centro de acopio (feature 016) con `telefonoEsWhatsApp`.
// Cuando el rol es COLABORADOR/SOLICITANTE, incluye los datos de contacto y
// ubicación (feature 017).
export type RegistroInput = {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  datosContacto?: DatosContacto;
  perfil?: DatosPerfilAdmin;
};

type Campos = {
  nombre: string;
  email: string;
  password: string;
  rol: typeof Rol.ADMIN | typeof Rol.COLABORADOR | typeof Rol.SOLICITANTE;
  // Contacto y ubicación (COLABORADOR/SOLICITANTE, feature 017; ubicación por
  // catálogo desde 020).
  cedula: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  estadoId: string;
  municipioId: string;
  // Perfil de administrador (solo se envían y validan si rol === ADMIN).
  nombreCuenta: string;
  correo: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  // WhatsApp flag del PerfilAdmin (feature 017 amplía 016).
  perfilTelefonoEsWhatsApp: boolean;
};

type Props = {
  // El server action se recibe como prop desde la página (server component), así
  // el formulario no importa la capa `app` y se mantiene reutilizable.
  action: (
    input: RegistroInput,
  ) => Promise<{ ok: boolean; error?: string; rol?: Rol }>;
  // Catálogo de ubicación (feature 020): estados y municipios para el selector.
  estados: Estado[];
  municipios: Municipio[];
};

const campo =
  "auth-field w-full aria-invalid:border-destructive";

export function RegistroForm({ action, estados, municipios }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Campos>({
    defaultValues: {
      rol: Rol.COLABORADOR,
      tipoDocumento: TipoDocumento.JURIDICO,
      telefonoEsWhatsApp: true,
      perfilTelefonoEsWhatsApp: true,
      estadoId: "",
      municipioId: "",
    },
  });

  // Se sigue el rol con estado local (en vez de `watch`, que desactiva la
  // memoización del React Compiler) para mostrar los campos condicionales.
  const [rolActual, setRolActual] = useState<Rol>(Rol.COLABORADOR);
  const esAdmin = rolActual === Rol.ADMIN;

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    const input: RegistroInput = {
      nombre: datos.nombre,
      email: datos.email,
      password: datos.password,
      rol: datos.rol,
      datosContacto: esAdmin
        ? {
            cedula: "",
            telefono: "",
            telefonoEsWhatsApp: datos.perfilTelefonoEsWhatsApp,
            estadoId: "",
            municipioId: "",
          }
        : {
            cedula: datos.cedula,
            telefono: datos.telefono,
            telefonoEsWhatsApp: datos.telefonoEsWhatsApp,
            estadoId: datos.estadoId,
            municipioId: datos.municipioId,
          },
      perfil: esAdmin
        ? {
            nombreCuenta: datos.nombreCuenta,
            estadoId: datos.estadoId,
            municipioId: datos.municipioId,
            telefono: datos.telefono,
            telefonoEsWhatsApp: datos.perfilTelefonoEsWhatsApp,
            correo: datos.correo,
            tipoDocumento: datos.tipoDocumento,
            numeroDocumento: datos.numeroDocumento,
          }
        : undefined,
    };
    startTransition(async () => {
      const resultado = await action(input);
      if (resultado.ok) {
        // Un ADMIN nace en PENDIENTE: se avisa en /login que un superadministrador
        // debe aprobar la cuenta antes de que pueda operar (feature 015).
        const registrado = resultado.rol === Rol.ADMIN ? "admin" : "1";
        router.push(`/login?registrado=${registrado}`);
      } else {
        setErrorServidor(resultado.error ?? "No se pudo completar el registro.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          Nombre
        </label>
        <input
          id="nombre"
          className={campo}
          aria-invalid={Boolean(errors.nombre)}
          {...register("nombre", {
            required: "Indica tu nombre.",
            minLength: { value: 2, message: "Indica tu nombre." },
          })}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={campo}
          aria-invalid={Boolean(errors.email)}
          {...register("email", { required: "Introduce tu email." })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          className={campo}
          aria-invalid={Boolean(errors.password)}
          {...register("password", {
            required: "Crea una contraseña.",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres.",
            },
          })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Quiero registrarme como</span>
        <Controller
          control={control}
          name="rol"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(valor) => {
                field.onChange(valor);
                setRolActual(valor as Rol);
              }}
            >
              <SelectTrigger
                aria-label="Quiero registrarme como"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Rol.COLABORADOR}>
                  Colaborador (quiero aportar)
                </SelectItem>
                <SelectItem value={Rol.SOLICITANTE}>
                  Solicitante (pido ayuda)
                </SelectItem>
                <SelectItem value={Rol.ADMIN}>
                  Administrador / centro de acopio (requiere aprobación)
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {esAdmin && (
          <p className="text-xs text-muted-foreground">
            Las cuentas de administrador quedan pendientes hasta que un
            superadministrador las aprueba.
          </p>
        )}
      </div>

      {!esAdmin && (
        <DatosContactoFields<Campos>
          register={register}
          control={control}
          errors={errors}
          estados={estados}
          municipios={municipios}
        />
      )}

      {esAdmin && (
        <fieldset className="flex flex-col gap-5 border-l-2 border-primary/35 bg-primary/[0.035] p-5">
          <legend className="px-1 text-sm font-medium">
            Datos del centro de acopio
          </legend>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombreCuenta" className="text-sm font-medium">
              Nombre de la cuenta
            </label>
            <input
              id="nombreCuenta"
              className={campo}
              aria-invalid={Boolean(errors.nombreCuenta)}
              {...register("nombreCuenta", {
                required: esAdmin && "Indica el nombre de la cuenta.",
              })}
            />
            {errors.nombreCuenta && (
              <p className="text-sm text-destructive">
                {errors.nombreCuenta.message}
              </p>
            )}
          </div>

          <SelectorUbicacion<Campos>
            control={control}
            errors={errors}
            estados={estados}
            municipios={municipios}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="telefono" className="text-sm font-medium">
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                className={campo}
                aria-invalid={Boolean(errors.telefono)}
                {...register("telefono", {
                  required: esAdmin && "Indica un teléfono.",
                })}
              />
              {errors.telefono && (
                <p className="text-sm text-destructive">
                  {errors.telefono.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="correo" className="text-sm font-medium">
                Correo de contacto
              </label>
              <input
                id="correo"
                type="email"
                className={campo}
                aria-invalid={Boolean(errors.correo)}
                {...register("correo", {
                  required: esAdmin && "Indica un correo de contacto.",
                })}
              />
              {errors.correo && (
                <p className="text-sm text-destructive">
                  {errors.correo.message}
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register("perfilTelefonoEsWhatsApp")}
            />
            Este número recibe WhatsApp
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Tipo de documento</span>
              <Controller
                control={control}
                name="tipoDocumento"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-label="Tipo de documento"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TipoDocumento.JURIDICO}>
                        Jurídico
                      </SelectItem>
                      <SelectItem value={TipoDocumento.NATURAL}>
                        Natural
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="numeroDocumento" className="text-sm font-medium">
                Número de documento
              </label>
              <input
                id="numeroDocumento"
                className={campo}
                aria-invalid={Boolean(errors.numeroDocumento)}
                {...register("numeroDocumento", {
                  required: esAdmin && "Indica el número de documento.",
                })}
              />
              {errors.numeroDocumento && (
                <p className="text-sm text-destructive">
                  {errors.numeroDocumento.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>
      )}

      {errorServidor && (
        <p className="text-sm text-destructive" role="alert">
          {errorServidor}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pendiente} className="mt-1 w-full active:scale-[0.985]">
        {pendiente ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
