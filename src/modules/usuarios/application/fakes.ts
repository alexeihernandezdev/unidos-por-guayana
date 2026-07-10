import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import type { DatosContacto } from "@/modules/usuarios/domain/datosContacto";
import type {
  CambiosPerfilAdmin,
  NuevoPerfilAdmin,
  PerfilAdmin,
} from "@/modules/usuarios/domain/PerfilAdmin";
import type { PerfilAdminRepository } from "@/modules/usuarios/domain/PerfilAdminRepository";
import type { NuevoUsuario, Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import { EstadoVerificacion, Rol } from "@/modules/usuarios/domain/Rol";

// Dobles en memoria para los tests de casos de uso. No tocan la base ni bcrypt.

export class InMemoryUsuarioRepository implements UsuarioRepository {
  private readonly porId = new Map<string, Usuario>();
  private secuencia = 0;

  async crear(datos: NuevoUsuario): Promise<Usuario> {
    const ahora = new Date();
    const usuario: Usuario = {
      id: `usuario-${++this.secuencia}`,
      estadoVerificacion: EstadoVerificacion.PENDIENTE,
      cedula: datos.cedula ?? null,
      telefono: datos.telefono ?? null,
      telefonoEsWhatsApp: datos.telefonoEsWhatsApp ?? false,
      estado: datos.estado ?? null,
      parroquia: datos.parroquia ?? null,
      createdAt: ahora,
      updatedAt: ahora,
      email: datos.email,
      nombre: datos.nombre,
      passwordHash: datos.passwordHash,
      rol: datos.rol,
    };
    this.porId.set(usuario.id, usuario);
    return usuario;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    for (const usuario of this.porId.values()) {
      if (usuario.email === email) return usuario;
    }
    return null;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.porId.get(id) ?? null;
  }

  async buscarPorCedula(cedula: string): Promise<Usuario | null> {
    for (const usuario of this.porId.values()) {
      if (usuario.cedula === cedula) return usuario;
    }
    return null;
  }

  async listarAdminsPendientes(): Promise<Usuario[]> {
    return [...this.porId.values()].filter(
      (usuario) =>
        usuario.rol === Rol.ADMIN &&
        usuario.estadoVerificacion === EstadoVerificacion.PENDIENTE,
    );
  }

  async actualizarEstadoVerificacion(
    id: string,
    estado: EstadoVerificacion,
  ): Promise<Usuario> {
    const usuario = this.porId.get(id);
    if (!usuario) {
      throw new Error(`Usuario "${id}" no encontrado.`);
    }
    const actualizado: Usuario = {
      ...usuario,
      estadoVerificacion: estado,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return actualizado;
  }

  async actualizarDatosContacto(
    id: string,
    datos: DatosContacto,
  ): Promise<Usuario> {
    const usuario = this.porId.get(id);
    if (!usuario) {
      throw new Error(`Usuario "${id}" no encontrado.`);
    }
    const actualizado: Usuario = {
      ...usuario,
      cedula: datos.cedula,
      telefono: datos.telefono,
      telefonoEsWhatsApp: datos.telefonoEsWhatsApp,
      estado: datos.estado,
      parroquia: datos.parroquia,
      updatedAt: new Date(),
    };
    this.porId.set(id, actualizado);
    return actualizado;
  }
}

export class InMemoryPerfilAdminRepository implements PerfilAdminRepository {
  private readonly porUsuarioId = new Map<string, PerfilAdmin>();
  private secuencia = 0;

  async crear(datos: NuevoPerfilAdmin): Promise<PerfilAdmin> {
    const ahora = new Date();
    const perfil: PerfilAdmin = {
      id: `perfil-${++this.secuencia}`,
      createdAt: ahora,
      updatedAt: ahora,
      ...datos,
    };
    this.porUsuarioId.set(perfil.usuarioId, perfil);
    return perfil;
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<PerfilAdmin | null> {
    return this.porUsuarioId.get(usuarioId) ?? null;
  }

  async actualizar(
    usuarioId: string,
    cambios: CambiosPerfilAdmin,
  ): Promise<PerfilAdmin> {
    const actual = this.porUsuarioId.get(usuarioId);
    if (!actual) {
      throw new Error(`Perfil de "${usuarioId}" no encontrado.`);
    }
    const actualizado: PerfilAdmin = {
      ...actual,
      ...cambios,
      updatedAt: new Date(),
    };
    this.porUsuarioId.set(usuarioId, actualizado);
    return actualizado;
  }
}

// Hasher falso, determinista y sin coste: marca el hash con un prefijo para poder
// comprobar en los tests que la contraseña se hasheó (no se guardó en claro).
export const PREFIJO_HASH = "hashed:";

export class FakePasswordHasher implements PasswordHasher {
  async hash(passwordPlano: string): Promise<string> {
    return `${PREFIJO_HASH}${passwordPlano}`;
  }

  async verificar(passwordPlano: string, hash: string): Promise<boolean> {
    return hash === `${PREFIJO_HASH}${passwordPlano}`;
  }
}
