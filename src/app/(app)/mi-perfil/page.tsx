import { Rol } from "@/modules/usuarios/domain/Rol";
import { DatosContactoForm } from "@/modules/usuarios/ui/DatosContactoForm";
import { buscarUsuarioPorId, requireRol } from "@/shared/auth";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { guardarDatosContactoAction } from "@/app/completar-perfil/actions";

// Perfil editable del COLABORADOR/SOLICITANTE (feature 017). Muestra los cinco
// campos precargados con los datos actuales; permite actualizarlos en
// cualquier momento con el mismo caso de uso que `/completar-perfil`. El guard
// `requireRol` ya se encarga de: rol autorizado, y perfil completo (si no lo
// está, redirige antes a `/completar-perfil`).
export default async function MiPerfilPage() {
  const sesion = await requireRol(Rol.COLABORADOR, Rol.SOLICITANTE);
  const usuario = await buscarUsuarioPorId(sesion.id);
  const { estados, municipios } = await cargarCatalogoUbicacion();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">
          Actualiza tu contacto y ubicación cuando lo necesites. Estos datos
          los usa el administrador para contactarte y coordinar la ayuda.
        </p>
      </div>

      <DatosContactoForm
        modo="editar"
        valoresIniciales={{
          cedula: usuario?.cedula ?? "",
          telefono: usuario?.telefono ?? "",
          telefonoEsWhatsApp: usuario?.telefonoEsWhatsApp ?? true,
          estadoId: usuario?.estadoId ?? "",
          municipioId: usuario?.municipioId ?? "",
        }}
        estados={estados}
        municipios={municipios}
        action={guardarDatosContactoAction}
        destinoOk="/mi-perfil"
      />
    </main>
  );
}
