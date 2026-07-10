import type { EstadoVerificacion, Rol } from "./Rol";

// Entidad de dominio. `passwordHash` guarda siempre la contraseña hasheada,
// nunca en claro. Los campos de contacto y ubicación son opcionales en la base
// (migración aditiva de la feature 017): son obligatorios en el flujo para los
// roles COLABORADOR/SOLICITANTE, pero el modelo se mantiene tolerante para no
// romper cuentas creadas antes de esa feature (las envía el guard a
// `/completar-perfil`).
export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  passwordHash: string;
  rol: Rol;
  estadoVerificacion: EstadoVerificacion;
  cedula: string | null;
  telefono: string | null;
  telefonoEsWhatsApp: boolean;
  estadoId: string | null;
  municipioId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Datos necesarios para dar de alta un usuario. `estadoVerificacion` no se pide
// aquí: nace en `PENDIENTE` por defecto (ver schema). Los datos de contacto son
// opcionales aquí (el ADMIN los persiste en `PerfilAdmin`, feature 016; los
// roles con contacto obligatorio los envían siempre desde la feature 017).
export type NuevoUsuario = {
  email: string;
  nombre: string;
  passwordHash: string;
  rol: Rol;
  cedula?: string | null;
  telefono?: string | null;
  telefonoEsWhatsApp?: boolean;
  estadoId?: string | null;
  municipioId?: string | null;
};
