import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { sembrarCatalogoUbicacion } from "./seed-ubicacion";

// Siembra el SUPERADMIN inicial (obligatorio, raíz de confianza — feature 015) y,
// si estamos en desarrollo, dos usuarios de prueba (COLABORADOR y SOLICITANTE)
// para no tener que registrarlos a mano al probar las features 006 y 007. Los
// ADMIN ya no se siembran: se registran públicamente y los aprueba el SUPERADMIN.
// Las credenciales vienen del entorno (nunca en el repo); ver `.env.example`.
// Ejecutar con: `pnpm db:seed`. Es idempotente: re-ejecutarlo actualiza la
// contraseña de cada usuario existente.
// El SUPERADMIN se siembra ya VERIFICADO; el estadoVerificacion de los usuarios
// de prueba se deja en su valor por defecto (PENDIENTE), que no afecta a
// COLABORADOR/SOLICITANTE (su verificación es la feature 013).

type SembradoUsuario = {
  etiqueta: string;
  email: string | undefined;
  password: string | undefined;
  nombre: string;
  rol: "SUPERADMIN" | "COLABORADOR" | "SOLICITANTE";
  requerido: boolean;
  // La raíz de confianza se siembra ya VERIFICADO. Para los demás se omite y
  // conserva el valor por defecto del schema (PENDIENTE).
  estadoVerificacion?: "PENDIENTE" | "VERIFICADO" | "RECHAZADO";
};

async function sembrarUsuario(
  prisma: PrismaClient,
  {
    etiqueta,
    email,
    password,
    nombre,
    rol,
    requerido,
    estadoVerificacion,
  }: SembradoUsuario,
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
  const datosEstado = estadoVerificacion ? { estadoVerificacion } : {};
  const usuario = await prisma.usuario.upsert({
    where: { email: emailNormalizado },
    update: { passwordHash, nombre, rol, ...datosEstado },
    create: { email: emailNormalizado, passwordHash, nombre, rol, ...datosEstado },
  });
  console.log(`✔ ${etiqueta} sembrado: ${usuario.email} (${usuario.rol})`);
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const catalogo = await sembrarCatalogoUbicacion(prisma);
    console.log(
      `✔ Catálogo ubicación: ${catalogo.estados} estados, ${catalogo.municipios} municipios`,
    );

    // SUPERADMIN: obligatorio. Raíz de confianza (feature 015): no se auto-registra
    // ni se promueve desde la app; es la única autoridad que aprueba cuentas ADMIN.
    await sembrarUsuario(prisma, {
      etiqueta: "SUPERADMIN",
      email: process.env.SUPERADMIN_EMAIL,
      password: process.env.SUPERADMIN_PASSWORD,
      nombre: process.env.SUPERADMIN_NOMBRE?.trim() || "Superadministrador",
      rol: "SUPERADMIN",
      requerido: true,
      estadoVerificacion: "VERIFICADO",
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
