import { getUsuarioActual } from "@/shared/auth";
import {
  contarNoLeidasServicio,
  listarNotificacionesServicio,
} from "@/shared/notificaciones";
import { CampanaCliente } from "./CampanaCliente";
import { formatearFecha, hrefDeNotificacion } from "./formato";

// Campana de la cabecera del espacio logeado (feature 012). Server component: lee la
// sesión y las últimas notificaciones, y delega el popover interactivo en el cliente.
// Si no hay sesión, no renderiza nada.
export async function CampanaNotificaciones() {
  const usuario = await getUsuarioActual();
  if (!usuario) return null;

  const [noLeidas, recientes] = await Promise.all([
    contarNoLeidasServicio(usuario.id),
    listarNotificacionesServicio(usuario.id, { limite: 8 }),
  ]);

  const items = recientes.map((n) => ({
    id: n.id,
    mensaje: n.mensaje,
    fecha: formatearFecha(n.createdAt),
    leida: n.leida,
    href: hrefDeNotificacion(usuario.rol, n),
  }));

  return <CampanaCliente noLeidas={noLeidas} items={items} />;
}
