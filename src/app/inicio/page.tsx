import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/shared/auth";
import { rutaInicioPorRol } from "@/shared/ui/app-shell";

// Despachador post-login (feature 021). El login redirige aquí y este segmento
// lleva a cada usuario a su espacio según rol, sin acoplar el formulario de
// login al rol (que solo se conoce tras autenticar). Sin sesión → /login.
export default async function InicioPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  redirect(rutaInicioPorRol(usuario.rol));
}
