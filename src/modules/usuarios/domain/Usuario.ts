import type { CategoriaRecurso } from "@/modules/recursos/domain/CategoriaRecurso";
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
  // Ubicación por catálogo (feature 020, sustituye a los antiguos `estado`/
  // `parroquia` de texto libre). FKs a `Estado`/`Municipio`.
  estadoId: string | null;
  municipioId: string | null;
  // Categorías de recurso que un COLABORADOR declara poder aportar (feature 025).
  // Vacío para otros roles. Obligatoria (>= 1) para COLABORADOR (regla de aplicación).
  categoriasAporte: CategoriaRecurso[];
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
  categoriasAporte?: CategoriaRecurso[];
};
