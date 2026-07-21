import { describe, expect, it } from "vitest";
import { EstadoVerificacion, Rol } from "@/modules/usuarios/domain/Rol";
import { FakePasswordHasher, InMemoryUsuarioRepository } from "./fakes";
import { SoloSuperadminError } from "./errors";
import {
  crearAuditor,
  listarAuditores,
  reactivarAuditor,
  suspenderAuditor,
} from "./gestionarAuditores";

const SUPERADMIN = { rol: Rol.SUPERADMIN } as const;

describe("gestión de auditores", () => {
  it("crea una cuenta activa que no depende de aprobación pública", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const auditor = await crearAuditor(
      { usuarios, hasher: new FakePasswordHasher() },
      SUPERADMIN,
      {
        nombre: "Ana Auditora",
        email: "ANA@EXAMPLE.COM",
        password: "segura-123",
      },
    );

    expect(auditor.rol).toBe(Rol.AUDITOR);
    expect(auditor.email).toBe("ana@example.com");
    expect(auditor.estadoVerificacion).toBe(EstadoVerificacion.VERIFICADO);
    expect(await listarAuditores({ usuarios }, SUPERADMIN)).toHaveLength(1);
  });

  it("permite suspender y reactivar sin borrar la cuenta", async () => {
    const usuarios = new InMemoryUsuarioRepository();
    const auditor = await crearAuditor(
      { usuarios, hasher: new FakePasswordHasher() },
      SUPERADMIN,
      { nombre: "Luis Auditor", email: "luis@example.com", password: "segura-123" },
    );

    expect(
      (await suspenderAuditor({ usuarios }, SUPERADMIN, auditor.id))
        .estadoVerificacion,
    ).toBe(EstadoVerificacion.RECHAZADO);
    expect(
      (await reactivarAuditor({ usuarios }, SUPERADMIN, auditor.id))
        .estadoVerificacion,
    ).toBe(EstadoVerificacion.VERIFICADO);
  });

  it("rechaza la gestión por roles distintos a SUPERADMIN", async () => {
    await expect(
      listarAuditores(
        { usuarios: new InMemoryUsuarioRepository() },
        { rol: Rol.ADMIN },
      ),
    ).rejects.toBeInstanceOf(SoloSuperadminError);
  });
});
