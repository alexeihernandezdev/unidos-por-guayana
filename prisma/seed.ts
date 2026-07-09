import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

// Siembra el ADMIN inicial. Las credenciales vienen del entorno (nunca en el
// repo): define ADMIN_EMAIL, ADMIN_PASSWORD y (opcional) ADMIN_NOMBRE en `.env`.
// Ejecutar con: `npm run db:seed` (usa jiti para correr TypeScript).
//
// El primer ADMIN no puede crearse desde el registro público (que rechaza el rol
// ADMIN); por eso se siembra. Es idempotente: re-ejecutarlo actualiza la
// contraseña del ADMIN existente.
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const nombre = process.env.ADMIN_NOMBRE?.trim() || "Administrador";

  if (!email || !password) {
    throw new Error(
      "Faltan credenciales del ADMIN. Define ADMIN_EMAIL y ADMIN_PASSWORD en .env.",
    );
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.usuario.upsert({
      where: { email },
      update: { passwordHash, nombre, rol: "ADMIN" },
      create: { email, passwordHash, nombre, rol: "ADMIN" },
    });
    console.log(`✔ ADMIN sembrado: ${admin.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
