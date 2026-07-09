import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Cliente Prisma como singleton: evita crear múltiples instancias con el HMR de
// Next en desarrollo (cada recarga volvería a instanciar el cliente). Ver
// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help
//
// Prisma 7 usa driver adapters: la conexión a PostgreSQL pasa por `@prisma/adapter-pg`
// con la `DATABASE_URL` del entorno (Docker en dev, Supabase en producción).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
