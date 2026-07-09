import type { EstadoVerificacion, Rol } from "./Rol";

// Entidad de dominio. `passwordHash` guarda siempre la contraseña hasheada,
// nunca en claro.
export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  passwordHash: string;
  rol: Rol;
  estadoVerificacion: EstadoVerificacion;
  createdAt: Date;
  updatedAt: Date;
};

// Datos necesarios para dar de alta un usuario. `estadoVerificacion` no se pide
// aquí: nace en `PENDIENTE` por defecto (ver schema).
export type NuevoUsuario = {
  email: string;
  nombre: string;
  passwordHash: string;
  rol: Rol;
};
