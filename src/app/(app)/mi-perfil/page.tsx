import { HeartHandshake, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { CategoriasEditor } from "@/modules/afiliaciones/ui/CategoriasEditor";
import { GestionAfiliaciones } from "@/modules/afiliaciones/ui/GestionAfiliaciones";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { DatosContactoForm } from "@/modules/usuarios/ui/DatosContactoForm";
import { listarCentrosDisponiblesServicio } from "@/shared/afiliaciones";
import { buscarUsuarioPorId, requireRol } from "@/shared/auth";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
import { cargarCatalogoUbicacion } from "@/shared/ubicacion";
import { guardarDatosContactoAction } from "@/app/completar-perfil/actions";
import {
  afiliarseAction,
  declararCategoriasAction,
  dejarCentroAction,
} from "./actions";

// Perfil editable del COLABORADOR/SOLICITANTE (feature 017). Muestra los cinco
// campos precargados con los datos actuales; permite actualizarlos en cualquier
// momento con el mismo caso de uso que `/completar-perfil`. Para el COLABORADOR
// añade (feature 025) la edición de categorías de aporte y la gestión de
// afiliaciones a centros de acopio.
export default async function MiPerfilPage() {
  const sesion = await requireRol(Rol.COLABORADOR, Rol.SOLICITANTE);
  const usuario = await buscarUsuarioPorId(sesion.id);
  const { estados, municipios } = await cargarCatalogoUbicacion();
  const esColaborador = sesion.rol === Rol.COLABORADOR;
  const centros = esColaborador
    ? await listarCentrosDisponiblesServicio(sesion.id)
    : [];

  return (
    <PanelPage>
      <PanelPageHeader
        icon={UserRound}
        eyebrow={esColaborador ? "Perfil de colaborador" : "Información personal"}
        title="Mi perfil"
        description={
          esColaborador
            ? "Administra cómo pueden contactarte, qué puedes aportar y los centros con los que colaboras."
            : "Mantén tus datos de contacto y ubicación actualizados para coordinar la ayuda."
        }
      />

      {esColaborador && (
        <nav aria-label="Secciones del perfil" className="flex gap-2 overflow-x-auto border-b pb-3">
          <a href="#centros" className="profile-section-link"><MapPin />Centros afiliados</a>
          <a href="#aportes" className="profile-section-link"><HeartHandshake />Cómo puedo ayudar</a>
          <a href="#datos" className="profile-section-link"><UserRound />Datos personales</a>
        </nav>
      )}

      <div className={esColaborador ? "grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]" : "max-w-2xl"}>
        <div className="flex min-w-0 flex-col gap-8">
        {esColaborador && (
          <section id="centros" className="profile-surface scroll-mt-6">
            <div className="profile-section-heading">
              <span className="profile-icon"><MapPin aria-hidden="true" /></span>
              <div>
                <h2>Centros afiliados</h2>
                <p>Construye tu red de colaboración y revisa dónde recibe aportes cada centro.</p>
              </div>
            </div>
            <GestionAfiliaciones centros={centros} afiliarseAction={afiliarseAction} dejarCentroAction={dejarCentroAction} />
          </section>
        )}

        {esColaborador && (
          <section id="aportes" className="profile-surface scroll-mt-6">
            <div className="profile-section-heading">
              <span className="profile-icon"><HeartHandshake aria-hidden="true" /></span>
              <div><h2>Cómo puedo ayudar</h2><p>Selecciona las capacidades por las que pueden convocarte.</p></div>
            </div>
            <CategoriasEditor valoresIniciales={usuario?.categoriasAporte ?? []} action={declararCategoriasAction} />
          </section>
        )}
        </div>

        <section id="datos" className="profile-surface scroll-mt-6 lg:sticky lg:top-8">
          <div className="profile-section-heading">
            <span className="profile-icon"><ShieldCheck aria-hidden="true" /></span>
            <div><h2>Datos personales</h2><p>Información privada usada para coordinar contigo.</p></div>
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
        </section>
      </div>
    </PanelPage>
  );
}
