import type { Rol } from "@/modules/usuarios/domain/Rol";
import { cn } from "@/shared/lib/utils";
import { ROL_DOT, ROL_ETIQUETA } from "./navConfig";

type Props = {
  rol: Rol;
  className?: string;
};

// Chip discreto que identifica el rol en el navbar. Un dot coloreado (ocre,
// teal o neutro) reemplaza el uppercase-tracked prohibido por tech-stack.md.
export function RoleChip({ rol, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs text-foreground/75",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", ROL_DOT[rol])}
      />
      {ROL_ETIQUETA[rol]}
    </span>
  );
}
