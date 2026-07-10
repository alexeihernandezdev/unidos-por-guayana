import { DateTime } from "luxon";
import {
  TipoDocumento,
  type PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import { Button } from "@/shared/ui/button";

// Cada cuenta pendiente con su perfil de centro de acopio (feature 016). El
// perfil puede faltar en cuentas antiguas registradas antes de la 016.
export type AdminPendiente = {
  admin: Pick<Usuario, "id" | "nombre" | "email" | "createdAt">;
  perfil: PerfilAdmin | null;
};

type Props = {
  pendientes: AdminPendiente[];
  // Server actions recibidos como props desde la página (server component), para
  // que el componente no importe la capa `app` y quede reutilizable.
  aprobarAction: (formData: FormData) => Promise<void>;
  rechazarAction: (formData: FormData) => Promise<void>;
};

const ETIQUETA_DOCUMENTO: Record<TipoDocumento, string> = {
  [TipoDocumento.JURIDICO]: "Jurídico",
  [TipoDocumento.NATURAL]: "Natural",
};

function fecha(valor: Date): string {
  return DateTime.fromJSDate(valor)
    .setLocale("es")
    .toLocaleString(DateTime.DATE_MED);
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm text-foreground">{valor}</dd>
    </div>
  );
}

/**
 * Bandeja de aprobación del superadministrador (features 015 + 016): lista las
 * cuentas `ADMIN` en `PENDIENTE` con los datos completos de su perfil de centro
 * de acopio y, por cada una, ofrece aprobar o rechazar. Cada acción es un
 * `<form>` que llama a un server action; no necesita JavaScript de cliente.
 */
export function BandejaAdmins({ pendientes, aprobarAction, rechazarAction }: Props) {
  if (pendientes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No hay cuentas de administrador pendientes de aprobación.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {pendientes.map(({ admin, perfil }) => (
        <li
          key={admin.id}
          className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium text-foreground">
                {perfil?.nombreCuenta ?? admin.nombre}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {admin.email}
              </span>
              <span className="text-xs text-muted-foreground">
                Solicitó el {fecha(admin.createdAt)}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <form action={aprobarAction}>
                <input type="hidden" name="adminId" value={admin.id} />
                <Button type="submit" size="sm">
                  Aprobar
                </Button>
              </form>
              <form action={rechazarAction}>
                <input type="hidden" name="adminId" value={admin.id} />
                <Button type="submit" size="sm" variant="outline">
                  Rechazar
                </Button>
              </form>
            </div>
          </div>

          {perfil ? (
            <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-3">
              <Dato etiqueta="Responsable" valor={admin.nombre} />
              <Dato etiqueta="Estado" valor={perfil.estado} />
              <Dato etiqueta="Parroquia" valor={perfil.parroquia} />
              <Dato etiqueta="Teléfono" valor={perfil.telefono} />
              <Dato etiqueta="Correo" valor={perfil.correo} />
              <Dato
                etiqueta="Documento"
                valor={`${ETIQUETA_DOCUMENTO[perfil.tipoDocumento]} · ${perfil.numeroDocumento}`}
              />
            </dl>
          ) : (
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              Esta cuenta no tiene perfil de centro de acopio (registrada antes de
              la feature 016).
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
