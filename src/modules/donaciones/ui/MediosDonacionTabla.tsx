import Link from "next/link";
import type { MedioDonacion } from "@/modules/donaciones/domain/MedioDonacion";
import { Button } from "@/shared/ui/button";
import { TipoMedioBadge } from "./TipoMedioBadge";

type Props = {
  medios: MedioDonacion[];
  // Server actions (basadas en FormData) recibidas desde la página. La tabla es un
  // server component; los botones envían un <form> con el id del medio.
  activarAction: (formData: FormData) => Promise<void>;
  desactivarAction: (formData: FormData) => Promise<void>;
};

const celda = "px-3 py-2 text-sm align-middle";

export function MediosDonacionTabla({
  medios,
  activarAction,
  desactivarAction,
}: Props) {
  if (medios.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay medios de donación. Añade uno para que el público sepa cómo
        donar.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <th className={celda}>Tipo</th>
            <th className={celda}>Titular</th>
            <th className={celda}>Datos</th>
            <th className={celda}>Moneda</th>
            <th className={celda}>Estado</th>
            <th className={`${celda} text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medios.map((medio) => (
            <tr
              key={medio.id}
              className="border-b border-border/60 last:border-0"
            >
              <td className={celda}>
                <TipoMedioBadge tipo={medio.tipo} />
              </td>
              <td className={celda}>
                <span className="font-medium">{medio.titular}</span>
                {medio.nota && (
                  <span className="block text-xs text-muted-foreground">
                    {medio.nota}
                  </span>
                )}
              </td>
              <td className={celda}>{medio.datos}</td>
              <td className={`${celda} numeric-tnum`}>{medio.moneda}</td>
              <td className={celda}>
                {medio.activo ? (
                  <span className="text-primary-ink">Activo</span>
                ) : (
                  <span className="text-muted-foreground">Oculto</span>
                )}
              </td>
              <td className={`${celda} text-right`}>
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/panel/donaciones/${medio.id}/editar`}>
                      Editar
                    </Link>
                  </Button>
                  <form
                    action={medio.activo ? desactivarAction : activarAction}
                  >
                    <input type="hidden" name="id" value={medio.id} />
                    <Button type="submit" variant="outline" size="sm">
                      {medio.activo ? "Ocultar" : "Mostrar"}
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
