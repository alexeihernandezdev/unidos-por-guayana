/**
 * Build de producción para Vercel.
 *
 * 1. Genera el cliente de Prisma
 * 2. En Vercel: aplica migraciones pendientes y corre el seed (idempotente)
 * 3. Compila Next.js
 *
 * Vercel define `VERCEL=1` en el build. En local, `pnpm build` solo genera
 * el cliente y compila (sin tocar la base).
 *
 * Variables requeridas en Vercel: DATABASE_URL, SUPERADMIN_EMAIL,
 * SUPERADMIN_PASSWORD (y AUTH_SECRET para la app).
 */
import { spawnSync } from "node:child_process";

function run(command, args) {
  console.log(`\n→ ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const isVercel = process.env.VERCEL === "1";

run("pnpm", ["exec", "prisma", "generate"]);

if (isVercel) {
  if (!process.env.DATABASE_URL) {
    console.error("Falta DATABASE_URL. Configúrala en las variables de entorno de Vercel.");
    process.exit(1);
  }
  run("pnpm", ["exec", "prisma", "migrate", "deploy"]);
  run("pnpm", ["db:seed"]);
} else {
  console.log("\n↷ Fuera de Vercel: se omite migrate deploy y seed.\n");
}

run("pnpm", ["exec", "next", "build"]);
