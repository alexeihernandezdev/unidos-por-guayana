import { redirect } from "next/navigation";
import { tieneDatosContactoCompletos } from "@/modules/usuarios/domain/datosContacto";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { DatosContactoForm } from "@/modules/usuarios/ui/DatosContactoForm";
import { buscarUsuarioPorId, requireSesion } from "@/shared/auth";
import { obtenerCatalogoUbicacionServicio } from "@/shared/ubicacion";
import { guardarDatosContactoAction } from "./actions";

export default async function CompletarPerfilPage() {
  const sesion = await requireSesion();
  if (sesion.rol !== Rol.COLABORADOR && sesion.rol !== Rol.SOLICITANTE) {
    redirect("/");
  }

  const [fresco, catalogo] = await Promise.all([
    buscarUsuarioPorId(sesion.id),
    obtenerCatalogoUbicacionServicio(),
  ]);

  if (fresco && tieneDatosContactoCompletos(fresco)) {
    redirect("/mi-perfil");
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Completa tu perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Para poder aportar o solicitar ayuda necesitamos tus datos de
          contacto y ubicación. Solo se completa una vez; luego los podrás
          editar en <strong>Mi perfil</strong>.
        </p>
      </div>

      <DatosContactoForm
        modo="completar"
        catalogo={catalogo}
        valoresIniciales={{
          cedula: fresco?.cedula ?? "",
          telefono: fresco?.telefono ?? "",
          telefonoEsWhatsApp: fresco?.telefonoEsWhatsApp ?? true,
          estadoId: fresco?.estadoId ?? "",
          municipioId: fresco?.municipioId ?? "",
        }}
        action={guardarDatosContactoAction}
        destinoOk="/"
      />
    </main>
  );
}
