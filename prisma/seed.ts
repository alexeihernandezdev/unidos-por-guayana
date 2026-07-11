import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { CAPITALES_VENEZUELA } from "./data/venezuela-capitales";
import {
  CATALOGO_UBICACION,
  TOTAL_ESTADOS,
  TOTAL_MUNICIPIOS,
} from "./data/venezuela-ubicacion";

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

// Siembra el catálogo de ubicación (feature 020): 24 estados y ~335 municipios
// de Venezuela. Idempotente: hace upsert por `codigo` (clave natural estable), de
// modo que re-ejecutar el seed no duplica filas ni rompe las FKs que apuntan al
// catálogo. Se ejecuta antes de los usuarios de prueba.
async function sembrarCatalogoUbicacion(prisma: PrismaClient): Promise<void> {
  // Coordenadas de la capital por código de estado (feature 011): centro
  // inicial del mapa al crear un punto de acopio.
  const capitalPorCodigo = new Map(
    CAPITALES_VENEZUELA.map((c) => [c.codigoEstado, c]),
  );
  let municipios = 0;
  for (const estado of CATALOGO_UBICACION) {
    const capital = capitalPorCodigo.get(estado.codigo);
    const coordenadasCapital = capital
      ? { latitudCapital: capital.latitud, longitudCapital: capital.longitud }
      : {};
    const estadoFila = await prisma.estado.upsert({
      where: { codigo: estado.codigo },
      update: { nombre: estado.nombre, ...coordenadasCapital },
      create: {
        codigo: estado.codigo,
        nombre: estado.nombre,
        ...coordenadasCapital,
      },
    });
    for (const municipio of estado.municipios) {
      await prisma.municipio.upsert({
        where: { codigo: municipio.codigo },
        update: { nombre: municipio.nombre, estadoId: estadoFila.id },
        create: {
          codigo: municipio.codigo,
          nombre: municipio.nombre,
          estadoId: estadoFila.id,
        },
      });
      municipios += 1;
    }
  }
  console.log(
    `✔ Catálogo de ubicación sembrado: ${TOTAL_ESTADOS} estados y ${municipios} municipios (esperados ${TOTAL_MUNICIPIOS}).`,
  );
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    // Catálogo de ubicación primero (feature 020): usuarios y perfiles pueden
    // referenciarlo por FK.
    await sembrarCatalogoUbicacion(prisma);

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
