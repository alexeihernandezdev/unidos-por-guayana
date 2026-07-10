"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { ADMIN_NAV } from "./navConfig";
import { SidebarNav } from "./SidebarNav";

type Props = {
  // El cluster de sesión (nombre + cerrar sesión) se renderiza en el server y se
  // inyecta como slot para no duplicar lógica de sesión en el cliente.
  slotSesion: React.ReactNode;
};

/**
 * Toggle + Sheet para el sidebar en móvil (< md). El botón vive en el topbar
 * móvil del `AdminShell`. Al navegar, el Sheet se cierra vía callback.
 */
export function MobileSidebar({ slotSesion }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menú del panel"
        className="focus-ring inline-flex size-10 items-center justify-center rounded-md text-foreground/80 transition-colors duration-150 hover:text-accent"
      >
        <MenuIcon strokeWidth={1.5} className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 max-w-[80vw] p-0">
        <SheetTitle className="sr-only">Panel de administración</SheetTitle>

        <div className="flex h-full flex-col">
          <div className="flex flex-col gap-8 px-4 pt-6">
            <Link
              href="/panel"
              onClick={() => setOpen(false)}
              className="focus-ring inline-flex items-center gap-3 px-2 leading-none"
              aria-label="Ir al panel de administración"
            >
              <Image
                src="/logo-mark.svg"
                alt=""
                width={24}
                height={24}
                priority
                className="h-6 w-6 shrink-0"
              />
              <span className="relative pb-[3px] font-serif text-sm leading-none tracking-tight text-foreground">
                <span className="italic text-foreground/60">Unidos por</span>{" "}
                <span className="font-semibold">la Guaira</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
                />
              </span>
            </Link>

            <SidebarNav
              sections={ADMIN_NAV}
              onNavigate={() => setOpen(false)}
            />
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-border px-4 py-4">
            {slotSesion}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
