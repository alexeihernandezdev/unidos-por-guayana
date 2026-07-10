"use server";

import { AuthError } from "next-auth";
import { signIn, validarCredencialesLogin } from "@/shared/auth";
import { destinoPostLogin } from "@/shared/shell";

// Inicia sesión con el provider de credenciales. En éxito, `signIn` lanza una
// redirección al panel del rol que debe propagarse; solo capturamos el error de
// credenciales inválidas para devolver un mensaje al formulario.
export async function iniciarSesionAction(input: {
  email: string;
  password: string;
}): Promise<{ error: string } | undefined> {
  const usuario = await validarCredencialesLogin(input.email, input.password);
  if (!usuario) {
    return { error: "Email o contraseña incorrectos." };
  }

  const redirectTo = await destinoPostLogin(usuario.id);

  try {
    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw error;
  }
}
