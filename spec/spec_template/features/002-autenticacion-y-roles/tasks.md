# 002 · Autenticación y roles — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, **proxy**
      —antes middleware—, server actions, authentication).
- [x] Confirmar e instalar dependencias nuevas (avisar): `next-auth@beta`,
      `@auth/prisma-adapter`, `bcryptjs` (+ `@types/bcryptjs`). `zod` ya estaba instalado.
- [x] Levantar la base: `docker compose up -d`. La base se publica en el puerto **5435** del host
      (el 5432 lo ocupa otro proyecto); `docker-compose.yml` mapea `5435:5432`.

## 1. Modelo de datos y migración

- [x] Añadir a `schema.prisma`: enums `Rol` y `EstadoVerificacion`, y modelo `Usuario`.
- [x] Tablas del adapter: **no aplican**. El provider de credenciales exige sesión JWT y no
      persiste vía adapter, así que no se usa `@auth/prisma-adapter` ni tablas OAuth (decisión
      documentada en `src/lib/auth.ts`).
- [x] `pnpm db:migrate` — primera migración (`20260709132158_init_usuarios`) aplicada en 5435.

## 2. Dominio (`src/modules/usuarios/domain`)

- [x] Entidad/tipo `Usuario` y `Rol`/`EstadoVerificacion` (sin Prisma ni framework).
- [x] Contrato `UsuarioRepository` (`crear`, `buscarPorEmail`).
- [x] Contrato `PasswordHasher` (`hash`, `verificar`).
- [x] Regla: roles auto-registrables = `COLABORADOR` | `SOLICITANTE` (`esRolAutoRegistrable`).

## 3. Aplicación (`src/modules/usuarios/application`)

- [x] Caso de uso `registrarUsuario` (rechaza `ADMIN`, valida email único, hashea y crea).
- [x] Caso de uso `validarCredenciales` (busca por email + verifica hash).
- [x] Capa pura (solo depende de `domain`) — lo verifica ESLint.

## 4. Infraestructura

- [x] `PrismaUsuarioRepository` sobre `src/lib/prisma.ts`.
- [x] `BcryptPasswordHasher` implementando `PasswordHasher`.
- [x] `src/lib/auth.ts`: Auth.js v5 + credentials provider (`authorize` → `validarCredenciales`),
      sesión JWT con `rol`/`id` en `callbacks` (sin adapter, ver 1).
- [x] Extender los tipos de sesión de Auth.js para incluir `rol` (`src/types/next-auth.d.ts`).

## 5. Presentación

- [x] Route handler `src/app/api/auth/[...nextauth]/route.ts` (re-exporta `handlers`).
- [x] Página de **registro** con formulario (React Hook Form) → server action `registrarUsuario`.
- [x] Página de **login** que usa `signIn("credentials", …)`; manejo de error de credenciales.
- [x] Acción de **logout** (`signOut`) — `src/shared/auth/actions.ts`.
- [x] Componentes de formulario en `src/modules/usuarios/ui` (PascalCase).

## 6. Protección por rol

- [x] `proxy.ts` (Next 16; antes `middleware.ts`) exige sesión en `/panel` y redirige a `/login`.
- [x] Helper `getUsuarioActual()` / `requireRol()` para servidor (`src/shared/auth`).
- [x] Ruta de ejemplo solo-`ADMIN` (`/panel`) que demuestra el gate por rol.

## 7. Seed de ADMIN

- [x] `prisma/seed.ts` que crea/actualiza un `ADMIN` inicial con contraseña hasheada
      (credenciales por entorno). Comando: `pnpm db:seed` (usa `jiti`, ya disponible).
- [x] Documentar variables del seed y `AUTH_SECRET` en `.env.example`.
- [ ] Verificar que el `ADMIN` sembrado puede iniciar sesión. ⛔ **Bloqueado por la base**.

## 8. Tests (Vitest)

- [x] `registrarUsuario`: rechaza `ADMIN`, hashea contraseña, rechaza email duplicado.
- [x] `validarCredenciales`: acepta correctas, rechaza incorrectas.
- [x] Tests colocados junto a cada caso de uso; **9/9 en verde**.

## 9. Validación final

- [x] `docker compose up -d` y base `healthy` (publicada en 5435).
- [x] `pnpm db:migrate` aplicada.
- [x] `pnpm test` en verde (9/9).
- [x] `pnpm lint` / `pnpm build` sin errores (0 warnings).
- [ ] `pnpm dev`: registrar colaborador, login/logout, y ruta solo-`ADMIN`. ⛔ **Pendiente base**.

## 10. Cierre

- [x] `usuarios/domain` y `usuarios/application` puras (sin framework/Prisma/Auth.js) — ESLint OK.
- [x] Verificar que `DOC/features/002-autenticacion-y-roles.md` refleja lo entregado.
- [ ] Mover `002 · Autenticación y roles` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `003 · Landing` a **Siguiente 🔜**. (Tras validar en vivo con la base.)
