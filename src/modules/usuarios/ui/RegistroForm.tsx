"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  TipoDocumento,
  type DatosPerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { Button } from "@/shared/ui/button";

// Payload que el formulario envía al server action. Cuando el rol es ADMIN,
// incluye el perfil de centro de acopio (feature 016).
export type RegistroInput = {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  perfil?: DatosPerfilAdmin;
};

type Campos = {
  nombre: string;
  email: string;
  password: string;
  rol: typeof Rol.ADMIN | typeof Rol.COLABORADOR | typeof Rol.SOLICITANTE;
  // Perfil de administrador (solo se envían y validan si rol === ADMIN).
  nombreCuenta: string;
  estado: string;
  parroquia: string;
  telefono: string;
  correo: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
};

type Props = {
  // El server action se recibe como prop desde la página (server component), así
  // el formulario no importa la capa `app` y se mantiene reutilizable.
  action: (
    input: RegistroInput,
  ) => Promise<{ ok: boolean; error?: string; rol?: Rol }>;
};

const campo =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function RegistroForm({ action }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Campos>({
    defaultValues: { rol: Rol.COLABORADOR, tipoDocumento: TipoDocumento.JURIDICO },
  });

  // Se sigue el rol con estado local (en vez de `watch`, que desactiva la
  // memoización del React Compiler) para mostrar los campos de perfil del admin.
  const [esAdmin, setEsAdmin] = useState(false);
  const rolField = register("rol");

  const onSubmit = handleSubmit((datos) => {
    setErrorServidor(null);
    const input: RegistroInput = {
      nombre: datos.nombre,
      email: datos.email,
      password: datos.password,
      rol: datos.rol,
      perfil: esAdmin
        ? {
            nombreCuenta: datos.nombreCuenta,
            estado: datos.estado,
            parroquia: datos.parroquia,
            telefono: datos.telefono,
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
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
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
        <input
          id="password"
          type="password"
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
        <label htmlFor="rol" className="text-sm font-medium">
          Quiero registrarme como
        </label>
        <select
          id="rol"
          className={campo}
          {...rolField}
          onChange={(event) => {
            rolField.onChange(event);
            setEsAdmin(event.target.value === Rol.ADMIN);
          }}
        >
          <option value={Rol.COLABORADOR}>Colaborador (quiero aportar)</option>
          <option value={Rol.SOLICITANTE}>Solicitante (pido ayuda)</option>
          <option value={Rol.ADMIN}>
            Administrador / centro de acopio (requiere aprobación)
          </option>
        </select>
        {esAdmin && (
          <p className="text-xs text-muted-foreground">
            Las cuentas de administrador quedan pendientes hasta que un
            superadministrador las aprueba.
          </p>
        )}
      </div>

      {esAdmin && (
        <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="estado" className="text-sm font-medium">
                Estado
              </label>
              <input
                id="estado"
                className={campo}
                aria-invalid={Boolean(errors.estado)}
                {...register("estado", {
                  required: esAdmin && "Indica el estado.",
                })}
              />
              {errors.estado && (
                <p className="text-sm text-destructive">
                  {errors.estado.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="parroquia" className="text-sm font-medium">
                Parroquia
              </label>
              <input
                id="parroquia"
                className={campo}
                aria-invalid={Boolean(errors.parroquia)}
                {...register("parroquia", {
                  required: esAdmin && "Indica la parroquia.",
                })}
              />
              {errors.parroquia && (
                <p className="text-sm text-destructive">
                  {errors.parroquia.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tipoDocumento" className="text-sm font-medium">
                Tipo de documento
              </label>
              <select
                id="tipoDocumento"
                className={campo}
                {...register("tipoDocumento")}
              >
                <option value={TipoDocumento.JURIDICO}>Jurídico</option>
                <option value={TipoDocumento.NATURAL}>Natural</option>
              </select>
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

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
