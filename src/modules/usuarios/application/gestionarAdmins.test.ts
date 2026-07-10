import { beforeEach, describe, expect, it } from "vitest";
import { EstadoVerificacion, Rol } from "@/modules/usuarios/domain/Rol";
import type { Usuario } from "@/modules/usuarios/domain/Usuario";
import { InMemoryUsuarioRepository } from "./fakes";
import {
  CuentaAdminNoAprobableError,
  SoloSuperadminError,
} from "./errors";
import {
  aprobarAdmin,
  listarAdminsPendientes,
  rechazarAdmin,
} from "./gestionarAdmins";

const SUPERADMIN = { rol: Rol.SUPERADMIN } as const;

async function crearUsuario(
  usuarios: InMemoryUsuarioRepository,
  rol: Rol,
): Promise<Usuario> {
  return usuarios.crear({
    email: `${rol.toLowerCase()}@example.com`,
    nombre: `Cuenta ${rol}`,
    passwordHash: "hash",
    rol,
  });
}

describe("gestionarAdmins", () => {
  let usuarios: InMemoryUsuarioRepository;

  beforeEach(() => {
    usuarios = new InMemoryUsuarioRepository();
  });

  describe("aprobarAdmin", () => {
    it("pasa una cuenta ADMIN PENDIENTE a VERIFICADO", async () => {
      const admin = await crearUsuario(usuarios, Rol.ADMIN);

      const resultado = await aprobarAdmin({ usuarios }, SUPERADMIN, admin.id);

      expect(resultado.estadoVerificacion).toBe(EstadoVerificacion.VERIFICADO);
      const persistido = await usuarios.buscarPorId(admin.id);
      expect(persistido?.estadoVerificacion).toBe(EstadoVerificacion.VERIFICADO);
    });

    it("rechaza si el actor no es SUPERADMIN", async () => {
      const admin = await crearUsuario(usuarios, Rol.ADMIN);

      await expect(
        aprobarAdmin({ usuarios }, { rol: Rol.ADMIN }, admin.id),
      ).rejects.toBeInstanceOf(SoloSuperadminError);
    });

    it("rechaza si la cuenta objetivo no es ADMIN", async () => {
      const colaborador = await crearUsuario(usuarios, Rol.COLABORADOR);

      await expect(
        aprobarAdmin({ usuarios }, SUPERADMIN, colaborador.id),
      ).rejects.toBeInstanceOf(CuentaAdminNoAprobableError);
    });

    it("rechaza si la cuenta ADMIN ya no está PENDIENTE", async () => {
      const admin = await crearUsuario(usuarios, Rol.ADMIN);
      await usuarios.actualizarEstadoVerificacion(
        admin.id,
        EstadoVerificacion.VERIFICADO,
      );

      await expect(
        aprobarAdmin({ usuarios }, SUPERADMIN, admin.id),
      ).rejects.toBeInstanceOf(CuentaAdminNoAprobableError);
    });
  });

  describe("rechazarAdmin", () => {
    it("pasa una cuenta ADMIN PENDIENTE a RECHAZADO", async () => {
      const admin = await crearUsuario(usuarios, Rol.ADMIN);

      const resultado = await rechazarAdmin({ usuarios }, SUPERADMIN, admin.id);

      expect(resultado.estadoVerificacion).toBe(EstadoVerificacion.RECHAZADO);
    });

    it("rechaza si el actor no es SUPERADMIN", async () => {
      const admin = await crearUsuario(usuarios, Rol.ADMIN);

      await expect(
        rechazarAdmin({ usuarios }, { rol: Rol.SOLICITANTE }, admin.id),
      ).rejects.toBeInstanceOf(SoloSuperadminError);
    });
  });

  describe("listarAdminsPendientes", () => {
    it("devuelve solo los ADMIN en PENDIENTE", async () => {
      const adminPendiente = await crearUsuario(usuarios, Rol.ADMIN);
      const adminVerificado = await usuarios.crear({
        email: "verificado@example.com",
        nombre: "Admin verificado",
        passwordHash: "hash",
        rol: Rol.ADMIN,
      });
      await usuarios.actualizarEstadoVerificacion(
        adminVerificado.id,
        EstadoVerificacion.VERIFICADO,
      );
      await crearUsuario(usuarios, Rol.COLABORADOR);

      const pendientes = await listarAdminsPendientes({ usuarios }, SUPERADMIN);

      expect(pendientes.map((u) => u.id)).toEqual([adminPendiente.id]);
    });

    it("rechaza si el actor no es SUPERADMIN", async () => {
      await expect(
        listarAdminsPendientes({ usuarios }, { rol: Rol.ADMIN }),
      ).rejects.toBeInstanceOf(SoloSuperadminError);
    });
  });
});
