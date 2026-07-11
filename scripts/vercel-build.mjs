/**
 * Build de producción para Vercel.
 *
 * 1. Genera el cliente de Prisma
 * 2. Solo en el deploy de PRODUCCIÓN de Vercel: aplica migraciones pendientes
 *    y corre el seed (idempotente)
 * 3. Compila Next.js
 *
 * Vercel define `VERCEL=1` en todo build y `VERCEL_ENV` con el entorno
 * (`production` | `preview` | `development`). Solo migramos en `production`:
 * los previews comparten el mismo `DATABASE_URL`, así que correr `migrate
 * deploy` desde una rama de feature envenenaría la base de producción (una
 * migración fallida deja `P3009` y bloquea todos los deploys). En local,
 * `pnpm build` solo genera el cliente y compila (sin tocar la base).
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
const isProduction = process.env.VERCEL_ENV === "production";

run("pnpm", ["exec", "prisma", "generate"]);

if (isVercel && isProduction) {
  if (!process.env.DATABASE_URL) {
    console.error("Falta DATABASE_URL. Configúrala en las variables de entorno de Vercel.");
    process.exit(1);
  }
  run("pnpm", ["exec", "prisma", "migrate", "deploy"]);
  run("pnpm", ["db:seed"]);
} else if (isVercel) {
  console.log(
    `\n↷ Entorno Vercel '${process.env.VERCEL_ENV}' (no producción): se omite migrate deploy y seed para no tocar la base de producción.\n`,
  );
} else {
  console.log("\n↷ Fuera de Vercel: se omite migrate deploy y seed.\n");
}

run("pnpm", ["exec", "next", "build"]);
