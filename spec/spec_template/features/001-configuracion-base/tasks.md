# 001 · Configuración base — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía relevante de Next.js 16 en `node_modules/next/dist/docs/` (layout, client
      components, providers).
- [ ] Confirmar acceso a una base PostgreSQL en Supabase (o local para desarrollo).

## 1. Estructura de carpetas

- [ ] Crear `src/modules/`, `src/shared/`, `src/lib/` y `prisma/`.
- [ ] Sembrar carpetas vacías con `.gitkeep` (o barril `index.ts`) para versionarlas.
- [ ] Verificar que `npm run lint` no reporte problemas de naming de carpetas.

## 2. Vitest

- [ ] Instalar: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`,
      `vite-tsconfig-paths` (dev).
- [ ] Crear `vitest.config.ts` (`environment: "jsdom"`, `globals: true`, `tsconfigPaths()`,
      `setupFiles`).
- [ ] Crear archivo de setup para `@testing-library/jest-dom`.
- [ ] Añadir scripts `test` y `test:watch` en `package.json`.
- [ ] Escribir un test de humo que importe con alias `@/…` y pase.
- [ ] `npm run test` en verde.

## 3. Docker — PostgreSQL local

- [ ] Crear `docker-compose.yml` con servicio `db` (imagen `postgres:16` con tag fijado).
- [ ] Configurar credenciales por entorno (`POSTGRES_USER`/`PASSWORD`/`DB`), puerto `5432`,
      volumen `pgdata` y `healthcheck` con `pg_isready`.
- [ ] `docker compose up -d` levanta la base; `docker compose ps` la muestra `healthy`.
- [ ] `docker compose down` la detiene sin perder los datos del volumen.

## 4. Prisma + PostgreSQL

- [ ] Instalar `@prisma/client` (runtime) y `prisma` (dev).
- [ ] `npx prisma init` → `prisma/schema.prisma` + entrada `DATABASE_URL` en `.env`.
- [ ] Dejar `schema.prisma` con `generator` + `datasource postgresql`, **sin modelos**.
- [ ] Crear cliente singleton en `src/lib/prisma.ts` (patrón `globalThis`).
- [ ] Apuntar `DATABASE_URL` de dev al PostgreSQL del contenedor de Docker.
- [ ] Añadir `DATABASE_URL` y credenciales del contenedor a `.env.example`; confirmar que
      `.env` está en `.gitignore`.
- [ ] Añadir scripts `db:generate` y `db:migrate`.
- [ ] Con la base arriba, `npx prisma generate` sin errores y Prisma conecta.

## 5. TanStack Query

- [ ] Instalar `@tanstack/react-query` (y devtools en dev, opcional).
- [ ] Crear el provider como client component (`providers.tsx`) con una instancia de
      `QueryClient`.
- [ ] Montar el provider en `src/app/layout.tsx`.
- [ ] Verificar arranque con `npm run dev` sin errores en consola.

## 6. Shadcn

- [ ] `npx shadcn@latest init` (versión compatible con Tailwind v4).
- [ ] Configurar `components.json`: salida a `src/shared`, util `cn` en `src/shared/lib`,
      tokens desde `globals.css`.
- [ ] Confirmar que **no** se creó un `tailwind.config.js` clásico.
- [ ] `npx shadcn@latest add button` y renderizarlo en una página de prueba.
- [ ] Verificar naming (PascalCase para `*.tsx`) con `npm run lint`.

## 7. React Hook Form, Zustand, Luxon

- [ ] Instalar `react-hook-form`, `zustand`, `luxon` + `@types/luxon`.
- [ ] Uso mínimo de verificación (import trivial o dentro del test de humo) para confirmar
      resolución y tipos.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `npm run lint` sin errores.
- [ ] `npm run build` sin errores.
- [ ] `npm run test` en verde.
- [ ] `npx prisma generate` sin errores.
- [ ] `npm run dev` arranca limpio con el `QueryClientProvider` activo y conecta a la base.

## 9. Cierre

- [ ] Revisar que ningún archivo nuevo viole la dirección de dependencias (domain/application
      puras).
- [ ] Verificar que `DOC/features/001-configuracion-base.md` refleja lo entregado.
- [ ] Mover `001 · Configuración base` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `002 · Autenticación y roles` a **Siguiente 🔜**.
- [ ] (Opcional) Actualizar la lista de librerías en `tech-stack.md` de "pendientes" a
      "instaladas".
