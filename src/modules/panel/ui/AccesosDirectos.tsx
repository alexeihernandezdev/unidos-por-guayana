import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export function AccesosDirectos() {
  return (
    <nav
      aria-label="Accesos directos"
      className="flex flex-wrap gap-2"
    >
      <Link
        href="/panel/ayudas/nueva"
        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
      >
        <PlusIcon strokeWidth={1.5} className="size-3.5" />
        Nueva ayuda
      </Link>
      <Link
        href="/panel/recursos/nuevo"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <PlusIcon strokeWidth={1.5} className="size-3.5" />
        Nuevo recurso
      </Link>
      <Link
        href="/panel/solicitudes"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Ver solicitudes
      </Link>
    </nav>
  );
}
