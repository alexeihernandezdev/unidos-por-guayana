import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

// Siembra el ADMIN inicial (obligatorio) y, si estamos en desarrollo, dos usuarios
// de prueba (COLABORADOR y SOLICITANTE) para no tener que registrarlos a mano al
// probar las features 006 y 007. Las credenciales vienen del entorno (nunca en el
// repo); ver `.env.example`.
// Ejecutar con: `pnpm db:seed`. Es idempotente: re-ejecutarlo actualiza la
// contraseña de cada usuario existente.

type SembradoUsuario = {
  etiqueta: string;
  email: string | undefined;
  password: string | undefined;
  nombre: string;
  rol: "ADMIN" | "COLABORADOR" | "SOLICITANTE";
  requerido: boolean;
};

async function sembrarUsuario(
  prisma: PrismaClient,
  { etiqueta, email, password, nombre, rol, requerido }: SembradoUsuario,
): Promise<void> {
  const emailNormalizado = email?.trim().toLowerCase();
  if (!emailNormalizado || !password) {
    if (requerido) {
      throw new Error(
        `Faltan credenciales del ${etiqueta}. Define email y contraseña en .env.`,
      );
    }
    console.log(`↷ ${etiqueta} omitido (falta email o contraseña en .env).`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const usuario = await prisma.usuario.upsert({
    where: { email: emailNormalizado },
    update: { passwordHash, nombre, rol },
    create: { email: emailNormalizado, passwordHash, nombre, rol },
  });
  console.log(`✔ ${etiqueta} sembrado: ${usuario.email} (${usuario.rol})`);
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    // ADMIN: obligatorio. No puede auto-registrarse desde la UI (ver feature 002).
    await sembrarUsuario(prisma, {
      etiqueta: "ADMIN",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      nombre: process.env.ADMIN_NOMBRE?.trim() || "Administrador",
      rol: "ADMIN",
      requerido: true,
    });

    // COLABORADOR y SOLICITANTE: opcionales. Se siembran si sus credenciales están
    // definidas en .env, para probar 006 (aportes) y 007 (solicitudes) sin pasar
    // por el registro público. En producción normalmente estas variables no existen
    // y el bloque se omite.
    await sembrarUsuario(prisma, {
      etiqueta: "COLABORADOR de prueba",
      email: process.env.COLABORADOR_EMAIL,
      password: process.env.COLABORADOR_PASSWORD,
      nombre: process.env.COLABORADOR_NOMBRE?.trim() || "Colaborador Prueba",
      rol: "COLABORADOR",
      requerido: false,
    });

    await sembrarUsuario(prisma, {
      etiqueta: "SOLICITANTE de prueba",
      email: process.env.SOLICITANTE_EMAIL,
      password: process.env.SOLICITANTE_PASSWORD,
      nombre: process.env.SOLICITANTE_NOMBRE?.trim() || "Solicitante Prueba",
      rol: "SOLICITANTE",
      requerido: false,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
