import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

// Seeder de DESARROLLO (feature 011): datos de prueba para ver el grid de
// puntos de acopio funcionando. NO usar en producción. Crea 5 admins
// pre-aprobados (VERIFICADO) con su PerfilAdmin y ~3 puntos de acopio cada
// uno (3 admins en Bolívar / Ciudad Guayana, 2 en otros estados), más 1
// colaborador con perfil completo. Idempotente: upsert por email y por
// (adminId, nombre) del punto.
//
// Cuentas: admin1@test.com … admin5@test.com y colaborador1@test.com,
// todas con contraseña 123.
//
// Ejecutar con: `pnpm db:seed:dev` (requiere el catálogo de ubicación ya
// sembrado: `pnpm db:seed` primero).

const PASSWORD = "123";

type SemillaPunto = {
  nombre: string;
  referencia: string;
  latitud: string;
  longitud: string;
  horarios: string;
  telefono: string;
  telefonoEsWhatsApp?: boolean;
  correo?: string;
};

type SemillaAdmin = {
  email: string;
  nombre: string;
  nombreCuenta: string;
  telefono: string;
  // Códigos del catálogo (ISO 3166-2:VE y `<estado>-<nn>`).
  codigoEstado: string;
  nombreMunicipio: string;
  puntos: SemillaPunto[];
};

// Ciudad Guayana = municipio Caroní (estado Bolívar). Coordenadas reales de
// zonas de Puerto Ordaz / San Félix; el resto en Caracas y Maracaibo.
const ADMINS: SemillaAdmin[] = [
  {
    email: "admin1@test.com",
    nombre: "Fundación Orinoco",
    nombreCuenta: "Fundación Orinoco",
    telefono: "0412 1110001",
    codigoEstado: "VE-F",
    nombreMunicipio: "Caroní",
    puntos: [
      {
        nombre: "Sede Alta Vista",
        referencia: "C.C. Ciudad Alta Vista, nivel PB, frente a la feria",
        latitud: "8.2951",
        longitud: "-62.7421",
        horarios: "Lunes a viernes de 9:00 a 17:00",
        telefono: "0412 1110001",
        correo: "altavista@orinoco.test",
      },
      {
        nombre: "Punto San Félix",
        referencia: "Plaza Bolívar de San Félix, casa amarilla con portón azul",
        latitud: "8.3591",
        longitud: "-62.6203",
        horarios: "Lunes a sábado de 8:00 a 14:00",
        telefono: "0414 1110002",
      },
      {
        nombre: "Punto Unare",
        referencia: "Sector Unare II, al lado del ambulatorio",
        latitud: "8.2765",
        longitud: "-62.7658",
        horarios: "Martes y jueves de 10:00 a 16:00",
        telefono: "0424 1110003",
        telefonoEsWhatsApp: false,
      },
    ],
  },
  {
    email: "admin2@test.com",
    nombre: "Manos de Guayana",
    nombreCuenta: "Manos de Guayana",
    telefono: "0414 2220001",
    codigoEstado: "VE-F",
    nombreMunicipio: "Caroní",
    puntos: [
      {
        nombre: "Sede Puerto Ordaz",
        referencia: "Centro de Puerto Ordaz, edificio Torre Loreto, PB",
        latitud: "8.2823",
        longitud: "-62.7186",
        horarios: "Lunes a viernes de 8:30 a 16:30",
        telefono: "0414 2220001",
        correo: "sede@manosguayana.test",
      },
      {
        nombre: "Punto Castillito",
        referencia: "Castillito, frente a la cancha techada",
        latitud: "8.2896",
        longitud: "-62.7069",
        horarios: "Sábados de 9:00 a 13:00",
        telefono: "0416 2220002",
      },
      {
        nombre: "Punto Los Olivos",
        referencia: "Urb. Los Olivos, casa comunal",
        latitud: "8.3012",
        longitud: "-62.7305",
        horarios: "Lunes, miércoles y viernes de 14:00 a 18:00",
        telefono: "0412 2220003",
      },
    ],
  },
  {
    email: "admin3@test.com",
    nombre: "Red Caroní Solidaria",
    nombreCuenta: "Red Caroní Solidaria",
    telefono: "0424 3330001",
    codigoEstado: "VE-F",
    nombreMunicipio: "Caroní",
    puntos: [
      {
        nombre: "Sede Villa Asia",
        referencia: "Villa Asia, local 12 del mercado municipal",
        latitud: "8.2704",
        longitud: "-62.7532",
        horarios: "Lunes a viernes de 9:00 a 15:00",
        telefono: "0424 3330001",
        correo: "villaasia@caroni.test",
      },
      {
        nombre: "Punto Core 8",
        referencia: "Core 8, iglesia San Buenaventura, salón parroquial",
        latitud: "8.3547",
        longitud: "-62.6412",
        horarios: "Domingos de 8:00 a 12:00",
        telefono: "0426 3330002",
      },
      {
        nombre: "Punto Chirica",
        referencia: "La Chirica, escuela básica, entrada lateral",
        latitud: "8.3689",
        longitud: "-62.6098",
        horarios: "Lunes a viernes de 7:00 a 12:00",
        telefono: "0412 3330003",
        telefonoEsWhatsApp: false,
      },
    ],
  },
  {
    email: "admin4@test.com",
    nombre: "Ayuda Capital",
    nombreCuenta: "Ayuda Capital",
    telefono: "0412 4440001",
    codigoEstado: "VE-A",
    nombreMunicipio: "Libertador",
    puntos: [
      {
        nombre: "Sede La Candelaria",
        referencia: "La Candelaria, esquina de Alcabala, local rojo",
        latitud: "10.5061",
        longitud: "-66.9036",
        horarios: "Lunes a viernes de 9:00 a 17:00",
        telefono: "0412 4440001",
        correo: "candelaria@ayudacapital.test",
      },
      {
        nombre: "Punto Catia",
        referencia: "Catia, boulevard, al lado de la estación del metro",
        latitud: "10.5169",
        longitud: "-66.9452",
        horarios: "Lunes a sábado de 8:00 a 14:00",
        telefono: "0414 4440002",
      },
      {
        nombre: "Punto El Valle",
        referencia: "El Valle, casa parroquial de la iglesia Santa Rosalía",
        latitud: "10.4581",
        longitud: "-66.8946",
        horarios: "Miércoles y sábados de 9:00 a 13:00",
        telefono: "0416 4440003",
      },
    ],
  },
  {
    email: "admin5@test.com",
    nombre: "Zulia Solidaria",
    nombreCuenta: "Zulia Solidaria",
    telefono: "0414 5550001",
    codigoEstado: "VE-V",
    nombreMunicipio: "Maracaibo",
    puntos: [
      {
        nombre: "Sede Bella Vista",
        referencia: "Av. Bella Vista con calle 72, edificio Onix, PB",
        latitud: "10.6666",
        longitud: "-71.6124",
        horarios: "Lunes a viernes de 8:00 a 16:00",
        telefono: "0414 5550001",
        correo: "bellavista@zuliasolidaria.test",
      },
      {
        nombre: "Punto La Limpia",
        referencia: "La Limpia, frente al centro comercial Gran Bazar",
        latitud: "10.6631",
        longitud: "-71.6712",
        horarios: "Lunes a sábado de 9:00 a 15:00",
        telefono: "0424 5550002",
      },
      {
        nombre: "Punto Centro",
        referencia: "Casco central, plaza Baralt, local de la gobernación",
        latitud: "10.6427",
        longitud: "-71.6125",
        horarios: "Lunes a viernes de 8:00 a 13:00",
        telefono: "0426 5550003",
        telefonoEsWhatsApp: false,
      },
    ],
  },
];

const COLABORADOR = {
  email: "colaborador1@test.com",
  nombre: "Carlos Colaborador",
  cedula: "V-20111222",
  telefono: "0412 9990001",
  codigoEstado: "VE-F",
  nombreMunicipio: "Caroní",
};

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(PASSWORD, 12);

    // Resolver ids del catálogo (debe estar sembrado: `pnpm db:seed`).
    async function ubicacion(codigoEstado: string, nombreMunicipio: string) {
      const estado = await prisma.estado.findUnique({
        where: { codigo: codigoEstado },
      });
      if (!estado) {
        throw new Error(
          `Estado ${codigoEstado} no encontrado. Ejecuta antes: pnpm db:seed`,
        );
      }
      const municipio = await prisma.municipio.findFirst({
        where: { estadoId: estado.id, nombre: nombreMunicipio },
      });
      if (!municipio) {
        throw new Error(
          `Municipio ${nombreMunicipio} no encontrado en ${codigoEstado}.`,
        );
      }
      return { estadoId: estado.id, municipioId: municipio.id };
    }

    for (const admin of ADMINS) {
      const { estadoId, municipioId } = await ubicacion(
        admin.codigoEstado,
        admin.nombreMunicipio,
      );

      const usuario = await prisma.usuario.upsert({
        where: { email: admin.email },
        update: {
          passwordHash,
          nombre: admin.nombre,
          rol: "ADMIN",
          estadoVerificacion: "VERIFICADO",
        },
        create: {
          email: admin.email,
          passwordHash,
          nombre: admin.nombre,
          rol: "ADMIN",
          estadoVerificacion: "VERIFICADO",
        },
      });

      const perfil = {
        nombreCuenta: admin.nombreCuenta,
        estadoId,
        municipioId,
        telefono: admin.telefono,
        telefonoEsWhatsApp: true,
        correo: admin.email,
        tipoDocumento: "JURIDICO" as const,
        numeroDocumento: `J-${admin.email.slice(5, 6)}0123456`,
      };
      await prisma.perfilAdmin.upsert({
        where: { usuarioId: usuario.id },
        update: perfil,
        create: { usuarioId: usuario.id, ...perfil },
      });

      for (const punto of admin.puntos) {
        const datos = {
          referencia: punto.referencia,
          latitud: punto.latitud,
          longitud: punto.longitud,
          horarios: punto.horarios,
          telefono: punto.telefono,
          telefonoEsWhatsApp: punto.telefonoEsWhatsApp ?? true,
          correo: punto.correo ?? null,
          estadoId,
          municipioId,
          activo: true,
        };
        await prisma.puntoAcopio.upsert({
          where: {
            adminId_nombre: { adminId: usuario.id, nombre: punto.nombre },
          },
          update: datos,
          create: { adminId: usuario.id, nombre: punto.nombre, ...datos },
        });
      }

      console.log(
        `✔ ${admin.email} (ADMIN VERIFICADO, ${admin.nombreMunicipio}) con ${admin.puntos.length} puntos.`,
      );
    }

    // Colaborador con perfil completo (pasa el guard de datos de contacto).
    const ubicacionColab = await ubicacion(
      COLABORADOR.codigoEstado,
      COLABORADOR.nombreMunicipio,
    );
    await prisma.usuario.upsert({
      where: { email: COLABORADOR.email },
      update: {
        passwordHash,
        nombre: COLABORADOR.nombre,
        rol: "COLABORADOR",
        cedula: COLABORADOR.cedula,
        telefono: COLABORADOR.telefono,
        telefonoEsWhatsApp: true,
        ...ubicacionColab,
      },
      create: {
        email: COLABORADOR.email,
        passwordHash,
        nombre: COLABORADOR.nombre,
        rol: "COLABORADOR",
        cedula: COLABORADOR.cedula,
        telefono: COLABORADOR.telefono,
        telefonoEsWhatsApp: true,
        ...ubicacionColab,
      },
    });
    console.log(`✔ ${COLABORADOR.email} (COLABORADOR, perfil completo).`);

    console.log(`\nContraseña de todas las cuentas: ${PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
