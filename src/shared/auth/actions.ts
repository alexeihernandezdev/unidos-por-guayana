"use server";

import { signOut } from "@/lib/auth";

// Cierra la sesión y redirige a /login. Server action reutilizable por cualquier
// página (se usa como `action` de un <form>).
export async function cerrarSesionAction() {
  await signOut({ redirectTo: "/login" });
}
