"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/shared/auth";

// Inicia sesión con el provider de credenciales. En éxito, `signIn` lanza una
// redirección (a `/inicio`, el despachador por rol de la feature 021) que debe
// propagarse; solo capturamos el error de credenciales inválidas para devolver
// un mensaje al formulario.
export async function iniciarSesionAction(
  retorno: string | undefined,
  input: { email: string; password: string },
): Promise<{ error: string } | undefined> {
  try {
    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirectTo: retorno === "/mis-testimonios" ? retorno : "/inicio",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }
}
