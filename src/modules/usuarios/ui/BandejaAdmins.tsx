import { DateTime } from "luxon";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import { Button } from "@/shared/ui/button";

type Props = {
  admins: Pick<Usuario, "id" | "nombre" | "email" | "createdAt">[];
  // Server actions recibidos como props desde la página (server component), para
  // que el componente no importe la capa `app` y quede reutilizable.
  aprobarAction: (formData: FormData) => Promise<void>;
  rechazarAction: (formData: FormData) => Promise<void>;
};

function fecha(valor: Date): string {
  return DateTime.fromJSDate(valor).setLocale("es").toLocaleString(
    DateTime.DATE_MED,
  );
}

/**
 * Bandeja de aprobación del superadministrador (feature 015): lista las cuentas
 * `ADMIN` en `PENDIENTE` y, por cada una, ofrece aprobar o rechazar. Cada acción
 * es un `<form>` que llama a un server action; no necesita JavaScript de cliente.
 */
export function BandejaAdmins({ admins, aprobarAction, rechazarAction }: Props) {
  if (admins.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No hay cuentas de administrador pendientes de aprobación.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {admins.map((admin) => (
        <li
          key={admin.id}
          className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium text-foreground">
              {admin.nombre}
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
        </li>
      ))}
    </ul>
  );
}
