import { getUsuarioActual } from "@/shared/auth";
import { cerrarSesionAction } from "@/shared/auth/actions";
import { LogOutIcon } from "lucide-react";
import { resolverPanelInicio } from "@/modules/shell/application/resolverPanelInicio";
import { buscarUsuarioPorId } from "@/shared/auth";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { AppSidebar } from "./AppSidebar";
import { BackButton } from "./BackButton";
import { MobileAppSidebar } from "./MobileAppSidebar";
import { inicioPanelPorRol, navSectionsPorRol } from "./navConfig";

// Shell del panel de funcionalidades para COLABORADOR, SOLICITANTE y SUPERADMIN
// (y pantallas de onboarding como completar-perfil / cuenta-admin pendiente).
export async function AppShell({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioActual();
  const inicioHref = usuario
    ? usuario.rol === Rol.ADMIN
      ? "/cuenta-admin"
      : inicioPanelPorRol(usuario.rol)
    : "/";

  const sections = usuario ? navSectionsPorRol(usuario.rol) : [];

  const clusterSesion = (
    <>
      {usuario && (
        <div className="flex flex-col gap-0.5 px-2">
          <span className="truncate text-sm text-foreground/85">
            {usuario.nombre ?? usuario.email}
          </span>
          <span
            className="truncate text-xs text-muted-foreground"
            title={usuario.email ?? undefined}
          >
            {usuario.email}
          </span>
        </div>
      )}
      <form action={cerrarSesionAction}>
        <button
          type="submit"
          className="focus-ring inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/75 transition-colors duration-150 hover:bg-muted/50 hover:text-accent"
        >
          <LogOutIcon strokeWidth={1.5} className="size-4" />
          Cerrar sesión
        </button>
      </form>
    </>
  );

  return (
    <div className="flex min-h-[100dvh] flex-col md:flex-row">
      <AppSidebar inicioHref={inicioHref} />

      <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <MobileAppSidebar
          inicioHref={inicioHref}
          sections={sections}
          slotSesion={clusterSesion}
        />
        <span className="relative pb-[2px] font-serif text-sm leading-none tracking-tight">
          <span className="italic text-foreground/60">Unidos por</span>{" "}
          <span className="font-semibold">la Guaira</span>
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[2px] bg-primary"
          />
        </span>
        <span className="size-10" aria-hidden />
      </div>

      <main className="flex min-w-0 flex-1 flex-col bg-background">
        <div className="border-b border-border px-4 py-2 md:px-6">
          <BackButton fallbackHref={inicioHref} />
        </div>
        {children}
      </main>
    </div>
  );
}

/** Resuelve el destino tras login con datos frescos de base para ADMIN. */
export async function destinoPostLogin(usuarioId: string): Promise<string> {
  const fresco = await buscarUsuarioPorId(usuarioId);
  if (!fresco) return "/";
  return resolverPanelInicio(fresco);
}
