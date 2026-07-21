import type { Rol } from "@/modules/usuarios/domain/Rol";
import type { EstadoTestimonio } from "./EstadoTestimonio";

export type AutorTestimonio = {
  id: string;
  nombre: string;
  rol: Rol;
  estado: string | null;
  municipio: string | null;
};

export type SolicitudDeTestimonio = {
  id: string;
  sector: string;
};

export type Testimonio = {
  id: string;
  autorId: string;
  autor: AutorTestimonio;
  solicitudId: string | null;
  solicitud: SolicitudDeTestimonio | null;
  titulo: string;
  contenido: string;
  estado: EstadoTestimonio;
  motivoRechazo: string | null;
  destacado: boolean;
  moderadoPorId: string | null;
  moderadoEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NuevoTestimonio = {
  autorId: string;
  solicitudId: string | null;
  titulo: string;
  contenido: string;
};

export type CambiosTestimonio = {
  solicitudId: string | null;
  titulo: string;
  contenido: string;
};
