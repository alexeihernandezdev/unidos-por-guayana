# 002 · Autenticación y roles — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (middleware, route handlers,
      server actions, server components).
- [ ] Confirmar e instalar dependencias nuevas (avisar): `next-auth@beta`,
      `@auth/prisma-adapter`, librería de hash (`bcryptjs` o `argon2`) y, si se usa, `zod`.
- [ ] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [ ] Añadir a `schema.prisma`: enums `Rol` y `EstadoVerificacion`, y modelo `Usuario`.
- [ ] Añadir las tablas que requiera el adapter de Auth.js (según estrategia de sesión).
- [ ] `npx prisma migrate dev` — primera migración aplicada sin errores.

## 2. Dominio (`src/modules/usuarios/domain`)

- [ ] Entidad/tipo `Usuario` y enum `Rol` (sin Prisma ni framework).
- [ ] Contrato `UsuarioRepository` (`crear`, `buscarPorEmail`).
- [ ] Contrato `PasswordHasher` (`hash`, `verificar`).
- [ ] Regla: roles auto-registrables = `COLABORADOR` | `SOLICITANTE`.

## 3. Aplicación (`src/modules/usuarios/application`)

- [ ] Caso de uso `registrarUsuario` (rechaza `ADMIN`, valida email único, hashea y crea).
- [ ] Caso de uso `validarCredenciales` (busca por email + verifica hash).
- [ ] Mantener la capa pura (solo depende de `domain`).

## 4. Infraestructura

- [ ] `PrismaUsuarioRepository` sobre `src/lib/prisma.ts`.
- [ ] `BcryptPasswordHasher` (o argon2) implementando `PasswordHasher`.
- [ ] `src/lib/auth.ts`: Auth.js v5 con adapter Prisma + credentials provider (`authorize` →
      `validarCredenciales`), sesión JWT con `rol`/`id` en `callbacks`.
- [ ] Extender los tipos de sesión de Auth.js para incluir `rol`.

## 5. Presentación

- [ ] Route handler `src/app/api/auth/[...nextauth]/route.ts` (re-exporta `handlers`).
- [ ] Página de **registro** con formulario (React Hook Form) que llama a `registrarUsuario`.
- [ ] Página de **login** que usa `signIn("credentials", …)`; manejo de error de credenciales.
- [ ] Acción de **logout** (`signOut`).
- [ ] Componentes de formulario en `src/modules/usuarios/ui` (PascalCase).

## 6. Protección por rol

- [ ] `middleware.ts` que exige sesión en rutas protegidas y redirige a `/login`.
- [ ] Helper `getUsuarioActual()` / `requireRol()` para servidor.
- [ ] Ruta de ejemplo solo-`ADMIN` que demuestra el gate por rol.

## 7. Seed de ADMIN

- [ ] `prisma/seed.ts` que crea un `ADMIN` inicial con contraseña hasheada (credenciales por
      entorno).
- [ ] Documentar variables del seed en `.env.example`; configurar el comando de seed.
- [ ] Verificar que el `ADMIN` sembrado puede iniciar sesión.

## 8. Tests (Vitest)

- [ ] `registrarUsuario`: rechaza `ADMIN`, hashea contraseña, rechaza email duplicado.
- [ ] `validarCredenciales`: acepta correctas, rechaza incorrectas.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 9. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `npx prisma migrate dev` aplicada.
- [ ] `npm run test` en verde.
- [ ] `npm run lint` / `npm run build` sin errores.
- [ ] `npm run dev`: registrar colaborador, login/logout, y ruta solo-`ADMIN` bloquea a no-admin.

## 10. Cierre

- [ ] Revisar que `usuarios/domain` y `usuarios/application` siguen puras (sin framework/Prisma/
      Auth.js).
- [ ] Verificar que `DOC/features/002-autenticacion-y-roles.md` refleja lo entregado.
- [ ] Mover `002 · Autenticación y roles` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `003 · Landing` a **Siguiente 🔜**.
