# 015 · Rol SUPERADMIN y registro público de administradores: Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. Esta feature enmienda la 002.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, **proxy**
      (antes middleware), server actions, authentication) por si cambian los guards.
- [x] Repasar lo que dejó la 002 en `src/modules/usuarios` y `src/lib/auth.ts`: enum `Rol`, regla de
      auto-registro, `authorize`/sesión, guards y `prisma/seed.ts`.
- [x] Levantar la base: `docker compose up -d` (puerto **5435** del host, como en la 002).

## 1. Modelo de datos y migración

- [x] Ampliar en `schema.prisma`: `enum Rol { SUPERADMIN ADMIN COLABORADOR SOLICITANTE }`.
- [x] Confirmar que `estadoVerificacion` (de la 002) basta; no se añaden campos nuevos.
- [x] `pnpm db:migrate`: migración aditiva del enum aplicada en 5435.

## 2. Dominio (`src/modules/usuarios/domain`)

- [x] Ampliar el enum/tipo `Rol` con `SUPERADMIN`.
- [x] Actualizar `esRolAutoRegistrable`: auto-registrables = `ADMIN` | `COLABORADOR` | `SOLICITANTE`;
      **rechaza** `SUPERADMIN`.
- [x] Función pura de transición de `estadoVerificacion` (`PENDIENTE → VERIFICADO | RECHAZADO`).
- [x] Predicado `puedeOperarComoAdmin(usuario)` = `ADMIN` + `VERIFICADO` (punto único de verdad).

## 3. Aplicación (`src/modules/usuarios/application`)

- [x] Enmendar `registrarUsuario`: admite `ADMIN` (lo crea en `PENDIENTE`), sigue rechazando
      `SUPERADMIN`, mantiene email único y hash.
- [x] Caso de uso `aprobarAdmin` (actor `SUPERADMIN`, objetivo `ADMIN` en `PENDIENTE` → `VERIFICADO`).
- [x] Caso de uso `rechazarAdmin` (análogo → `RECHAZADO`).
- [x] Caso de uso `listarAdminsPendientes`.
- [x] Guardia reutilizable de operatividad para acciones de administración.
- [x] Capa pura (solo depende de `domain`); lo verifica ESLint.

## 4. Infraestructura

- [x] Ampliar `PrismaUsuarioRepository`: `listarAdminsPendientes` y `actualizarEstadoVerificacion`.
- [x] `src/lib/auth.ts`: confirmar que `SUPERADMIN` viaja en token/sesión igual que los demás roles.
- [x] Helper para leer `estadoVerificacion` fresco de base en acciones sensibles (si se opta por ello).
- [x] Confirmar que los tipos de sesión de Auth.js admiten el nuevo valor de `rol`.

## 5. Presentación

- [x] Registro: admitir `ADMIN` como opción pública; aviso de "cuenta pendiente de aprobación" al
      registrarse. El server action delega en el `registrarUsuario` enmendado.
- [x] Bandeja del superadmin (`/superadmin/admins`): lista `ADMIN` en `PENDIENTE` con acciones
      **aprobar** / **rechazar** (server actions → `aprobarAdmin` / `rechazarAdmin`).
- [x] Componentes de UI en `src/modules/usuarios/ui` (PascalCase); primitivos de `src/shared/ui`.

## 6. Enforcement por estado

- [x] Guard `requireAdminVerificado()` (junto a `requireRol()` de la 002) para rutas/acciones de
      administración; bloquea a `ADMIN` en `PENDIENTE`/`RECHAZADO`.
- [x] Guard `requireRol("SUPERADMIN")` para la bandeja del superadmin.
- [x] Proxy (antes middleware) protege el prefijo de superadmin; chequeo fino en guard + casos de uso.

## 7. Seed de SUPERADMIN (enmienda del seed de la 002)

- [x] `prisma/seed.ts` crea/actualiza un `SUPERADMIN` inicial (credenciales por entorno); ya no
      siembra un `ADMIN`.
- [x] Actualizar `.env.example` con las variables del seed del `SUPERADMIN`.
- [x] Verificar que el `SUPERADMIN` sembrado puede iniciar sesión y aprobar cuentas.

## 8. Tests (Vitest)

- [x] `registrarUsuario`: admite `ADMIN` en `PENDIENTE`, rechaza `SUPERADMIN`, mantiene email único.
- [x] `aprobarAdmin` / `rechazarAdmin`: transiciones válidas e inválidas y control del actor.
- [x] `puedeOperarComoAdmin`: verdadero solo con `ADMIN` + `VERIFICADO`.
- [x] Tests colocados junto a cada caso de uso; en verde.

## 9. Validación final

- [x] `docker compose up -d` y base `healthy` (publicada en 5435).
- [x] `pnpm db:migrate` aplicada y `pnpm db:seed` con `SUPERADMIN` sembrado.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: registrar `ADMIN` (queda `PENDIENTE`, no opera), aprobar desde la bandeja y
      comprobar que opera; rechazar otro y comprobar bloqueo; bandeja del superadmin inaccesible para
      los demás roles.

## 10. Cierre

- [x] `usuarios/domain` y `usuarios/application` puras (sin framework/Prisma/Auth.js); ESLint OK.
- [x] Revisar que la spec de la 002 refleje el seed de `SUPERADMIN` y el registro público de `ADMIN`.
- [x] Verificar que `DOC/features/015-superadmin-y-registro-de-administradores.md` refleja lo
      entregado.
- [x] Mover `015` a **Hecho ✅** en `constitution/roadmap.md` y dejar lista la base para `016 · Perfil
      de administrador y centro de acopio`.
