import { cn } from "@/shared/lib/utils";

// Contenedor de página del espacio logeado (feature 026, guía
// `constitution/ui-guidelines.md §1`). Materializa el marco de página: padding y
// ritmo vertical. Ocupa todo el ancho disponible (sin `max-w` ni `mx-auto`): la
// página se alinea a la izquierda y se estira a lo ancho del área de contenido.
// NO es `<main>` (el único `<main>` lo provee `AppShell`, 021); es un `<div>` que
// replica `flex flex-1 flex-col` para no perder el estiramiento vertical que
// colgaba del `<main>` anterior.

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function PanelPage({ className, children }: Props) {
  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col gap-7 p-5 md:p-8 lg:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
