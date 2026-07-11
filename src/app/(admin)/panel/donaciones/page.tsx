import Link from "next/link";
import { IngresosMonetariosTabla } from "@/modules/donaciones/ui/IngresosMonetariosTabla";
import { MediosDonacionTabla } from "@/modules/donaciones/ui/MediosDonacionTabla";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarIngresosExternosServicio } from "@/shared/aportes";
import { requireRol } from "@/shared/auth";
import { listarMediosDonacionServicio } from "@/shared/donaciones";
import { Button } from "@/shared/ui/button";
import {
  activarMedioDonacionAction,
  desactivarMedioDonacionAction,
} from "./actions";

export default async function DonacionesPage() {
  await requireRol(Rol.ADMIN);

  const [medios, ingresos] = await Promise.all([
    listarMediosDonacionServicio(),
    listarIngresosExternosServicio(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Donaciones monetarias
        </h1>
        <p className="text-sm text-muted-foreground">
          Muestra al público cómo donar dinero y registra los montos ya recibidos
          por fuera. La aplicación no procesa ningún pago.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Medios de donación
            </h2>
            <p className="text-sm text-muted-foreground">
              Canales externos por los que el público puede donar (cuenta, Pago
              Móvil, Zelle, PayPal…).
            </p>
          </div>
          <Button asChild>
            <Link href="/panel/donaciones/nuevo">Nuevo medio</Link>
          </Button>
        </div>
        <MediosDonacionTabla
          medios={medios}
          activarAction={activarMedioDonacionAction}
          desactivarAction={desactivarMedioDonacionAction}
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Ingresos monetarios registrados
            </h2>
            <p className="text-sm text-muted-foreground">
              Montos ya recibidos por fuera que suman a la transparencia.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/panel/donaciones/ingresos/nuevo">
              Registrar ingreso
            </Link>
          </Button>
        </div>
        <IngresosMonetariosTabla ingresos={ingresos} />
      </section>
    </main>
  );
}
