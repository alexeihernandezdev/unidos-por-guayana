import type { PasswordHasher } from "@/modules/usuarios/domain/PasswordHasher";
import {
  EstadoVerificacion,
  Rol,
  type Rol as RolType,
} from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import type { UsuarioRepository } from "@/modules/usuarios/domain/UsuarioRepository";
import {
  CuentaAuditorInvalidaError,
  EmailYaRegistradoError,
  SoloSuperadminError,
  UsuarioNoEncontradoError,
} from "./errors";

type Deps = { usuarios: UsuarioRepository; hasher: PasswordHasher };
type Actor = { rol: RolType };

function exigirSuperadmin(actor: Actor): void {
  if (actor.rol !== Rol.SUPERADMIN) throw new SoloSuperadminError();
}

export async function listarAuditores(
  { usuarios }: Pick<Deps, "usuarios">,
  actor: Actor,
): Promise<Usuario[]> {
  exigirSuperadmin(actor);
  return usuarios.listarPorRol(Rol.AUDITOR);
}

export async function crearAuditor(
  { usuarios, hasher }: Deps,
  actor: Actor,
  input: { nombre: string; email: string; password: string },
): Promise<Usuario> {
  exigirSuperadmin(actor);
  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();
  if (nombre.length < 2 || nombre.length > 80) {
    throw new CuentaAuditorInvalidaError("Indica un nombre válido.");
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new CuentaAuditorInvalidaError("Introduce un email válido.");
  }
  if (input.password.length < 8 || input.password.length > 100) {
    throw new CuentaAuditorInvalidaError(
      "La contraseña debe tener entre 8 y 100 caracteres.",
    );
  }
  if (await usuarios.buscarPorEmail(email)) {
    throw new EmailYaRegistradoError(email);
  }

  return usuarios.crear({
    nombre,
    email,
    passwordHash: await hasher.hash(input.password),
    rol: Rol.AUDITOR,
    estadoVerificacion: EstadoVerificacion.VERIFICADO,
  });
}

async function cambiarEstadoAuditor(
  usuarios: UsuarioRepository,
  actor: Actor,
  auditorId: string,
  estado: typeof EstadoVerificacion.VERIFICADO | typeof EstadoVerificacion.RECHAZADO,
): Promise<Usuario> {
  exigirSuperadmin(actor);
  const auditor = await usuarios.buscarPorId(auditorId);
  if (!auditor) throw new UsuarioNoEncontradoError(auditorId);
  if (auditor.rol !== Rol.AUDITOR) {
    throw new CuentaAuditorInvalidaError("La cuenta indicada no es auditora.");
  }
  return usuarios.actualizarEstadoVerificacion(auditorId, estado);
}

export const suspenderAuditor = (
  { usuarios }: Pick<Deps, "usuarios">,
  actor: Actor,
  auditorId: string,
) =>
  cambiarEstadoAuditor(
    usuarios,
    actor,
    auditorId,
    EstadoVerificacion.RECHAZADO,
  );

export const reactivarAuditor = (
  { usuarios }: Pick<Deps, "usuarios">,
  actor: Actor,
  auditorId: string,
) =>
  cambiarEstadoAuditor(
    usuarios,
    actor,
    auditorId,
    EstadoVerificacion.VERIFICADO,
  );
