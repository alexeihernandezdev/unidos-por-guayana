import Link from "next/link";
import { AuthShell } from "@/modules/usuarios/ui/AuthShell";
import { RegistroForm } from "@/modules/usuarios/ui/RegistroForm";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { registrarUsuarioAction } from "./actions";

export default async function RegistroPage() {
  const { estados, municipios } = await cargarCatalogoUbicacion();

  return (
    <AuthShell
      eyebrow="Únete a la red"
      title="Tu lugar para ayudar o pedir apoyo."
      description="Crea tu perfil y dinos cómo quieres participar. Podrás completar o actualizar tus datos más adelante."
      wide
      footer={
        <p>
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="auth-inline-link focus-ring">
            Iniciar sesión
          </Link>
        </p>
      }
    >
      <RegistroForm
        action={registrarUsuarioAction}
        estados={estados}
        municipios={municipios}
      />
    </AuthShell>
  );
}
