import Link from "next/link";
import {
  ESTADOS_AYUDA,
  esEstadoAyuda,
} from "@/modules/ayudas/domain/EstadoAyuda";
import type { FiltroAyudas } from "@/modules/ayudas/domain/AyudaRepository";
import { AyudasTabla } from "@/modules/ayudas/ui/AyudasTabla";
import { ESTADO_LABEL } from "@/modules/ayudas/ui/estados";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarAyudasServicio } from "@/shared/ayudas";
import { requireRol } from "@/shared/auth";
import { Button } from "@/shared/ui/button";
import { eliminarAyudaAction } from "./actions";

type Props = {
  searchParams: Promise<{ estado?: string }>;
};

const campo =
  "rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export default async function AyudasPage({ searchParams }: Props) {
  await requireRol(Rol.ADMIN);

  const { estado } = await searchParams;

  const filtro: FiltroAyudas = {};
  if (estado && esEstadoAyuda(estado)) filtro.estado = estado;

  const ayudas = await listarAyudasServicio(filtro);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Envíos de ayuda
          </h1>
          <p className="text-sm text-muted-foreground">
            Planifica y sigue cada envío: destino, fecha, metas y estado.
          </p>
        </div>
        <Button asChild>
          <Link href="/panel/ayudas/nueva">Nuevo envío</Link>
        </Button>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 border-t border-border pt-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="estado" className="text-sm font-medium">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={filtro.estado ?? ""}
            className={campo}
          >
            <option value="">Todos</option>
            {ESTADOS_AYUDA.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <AyudasTabla ayudas={ayudas} eliminarAction={eliminarAyudaAction} />
    </main>
  );
}
