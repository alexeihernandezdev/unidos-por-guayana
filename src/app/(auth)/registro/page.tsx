import Link from "next/link";
import { RegistroForm } from "@/modules/usuarios/ui/RegistroForm";
import { registrarUsuarioAction } from "./actions";

export default function RegistroPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Regístrate para colaborar o solicitar ayuda.
        </p>
      </div>

      <RegistroForm action={registrarUsuarioAction} />

      <p className="text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
