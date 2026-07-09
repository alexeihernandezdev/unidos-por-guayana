import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Rol } from "@/modules/usuarios/domain/Rol";

// Helpers de sesión para el servidor (server components, server actions y route
// handlers). `src/shared` es transversal, así que la presentación puede leer la
// sesión a través de aquí sin importar `src/lib` directamente.

export type UsuarioSesion = {
  id: string;
  rol: Rol;
  nombre: string | null;
  email: string | null;
};

/** Devuelve el usuario de la sesión actual, o `null` si no hay sesión. */
export async function getUsuarioActual(): Promise<UsuarioSesion | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    rol: session.user.rol,
    nombre: session.user.name ?? null,
    email: session.user.email ?? null,
  };
}

/** Exige sesión; si no hay, redirige a /login. */
export async function requireSesion(): Promise<UsuarioSesion> {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  return usuario;
}

/**
 * Exige que el usuario tenga uno de los roles indicados. Sin sesión → /login;
 * con sesión pero rol no autorizado → inicio (/). Es el gate por rol para el
 * servidor.
 */
export async function requireRol(...roles: Rol[]): Promise<UsuarioSesion> {
  const usuario = await requireSesion();
  if (!roles.includes(usuario.rol)) redirect("/");
  return usuario;
}
