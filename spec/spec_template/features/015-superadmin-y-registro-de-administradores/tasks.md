# 015 · Rol SUPERADMIN y registro público de administradores: Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. Esta feature enmienda la 002.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, **proxy**
      (antes middleware), server actions, authentication) por si cambian los guards.
- [ ] Repasar lo que dejó la 002 en `src/modules/usuarios` y `src/lib/auth.ts`: enum `Rol`, regla de
      auto-registro, `authorize`/sesión, guards y `prisma/seed.ts`.
- [ ] Levantar la base: `docker compose up -d` (puerto **5435** del host, como en la 002).

## 1. Modelo de datos y migración

- [ ] Ampliar en `schema.prisma`: `enum Rol { SUPERADMIN ADMIN COLABORADOR SOLICITANTE }`.
- [ ] Confirmar que `estadoVerificacion` (de la 002) basta; no se añaden campos nuevos.
- [ ] `pnpm db:migrate`: migración aditiva del enum aplicada en 5435.

## 2. Dominio (`src/modules/usuarios/domain`)

- [ ] Ampliar el enum/tipo `Rol` con `SUPERADMIN`.
- [ ] Actualizar `esRolAutoRegistrable`: auto-registrables = `ADMIN` | `COLABORADOR` | `SOLICITANTE`;
      **rechaza** `SUPERADMIN`.
- [ ] Función pura de transición de `estadoVerificacion` (`PENDIENTE → VERIFICADO | RECHAZADO`).
- [ ] Predicado `puedeOperarComoAdmin(usuario)` = `ADMIN` + `VERIFICADO` (punto único de verdad).

## 3. Aplicación (`src/modules/usuarios/application`)

- [ ] Enmendar `registrarUsuario`: admite `ADMIN` (lo crea en `PENDIENTE`), sigue rechazando
      `SUPERADMIN`, mantiene email único y hash.
- [ ] Caso de uso `aprobarAdmin` (actor `SUPERADMIN`, objetivo `ADMIN` en `PENDIENTE` → `VERIFICADO`).
- [ ] Caso de uso `rechazarAdmin` (análogo → `RECHAZADO`).
- [ ] Caso de uso `listarAdminsPendientes`.
- [ ] Guardia reutilizable de operatividad para acciones de administración.
- [ ] Capa pura (solo depende de `domain`); lo verifica ESLint.

## 4. Infraestructura

- [ ] Ampliar `PrismaUsuarioRepository`: `listarAdminsPendientes` y `actualizarEstadoVerificacion`.
- [ ] `src/lib/auth.ts`: confirmar que `SUPERADMIN` viaja en token/sesión igual que los demás roles.
- [ ] Helper para leer `estadoVerificacion` fresco de base en acciones sensibles (si se opta por ello).
- [ ] Confirmar que los tipos de sesión de Auth.js admiten el nuevo valor de `rol`.

## 5. Presentación

- [ ] Registro: admitir `ADMIN` como opción pública; aviso de "cuenta pendiente de aprobación" al
      registrarse. El server action delega en el `registrarUsuario` enmendado.
- [ ] Bandeja del superadmin (`/superadmin/admins`): lista `ADMIN` en `PENDIENTE` con acciones
      **aprobar** / **rechazar** (server actions → `aprobarAdmin` / `rechazarAdmin`).
- [ ] Componentes de UI en `src/modules/usuarios/ui` (PascalCase); primitivos de `src/shared/ui`.

## 6. Enforcement por estado

- [ ] Guard `requireAdminVerificado()` (junto a `requireRol()` de la 002) para rutas/acciones de
      administración; bloquea a `ADMIN` en `PENDIENTE`/`RECHAZADO`.
- [ ] Guard `requireRol("SUPERADMIN")` para la bandeja del superadmin.
- [ ] Proxy (antes middleware) protege el prefijo de superadmin; chequeo fino en guard + casos de uso.

## 7. Seed de SUPERADMIN (enmienda del seed de la 002)

- [ ] `prisma/seed.ts` crea/actualiza un `SUPERADMIN` inicial (credenciales por entorno); ya no
      siembra un `ADMIN`.
- [ ] Actualizar `.env.example` con las variables del seed del `SUPERADMIN`.
- [ ] Verificar que el `SUPERADMIN` sembrado puede iniciar sesión y aprobar cuentas.

## 8. Tests (Vitest)

- [ ] `registrarUsuario`: admite `ADMIN` en `PENDIENTE`, rechaza `SUPERADMIN`, mantiene email único.
- [ ] `aprobarAdmin` / `rechazarAdmin`: transiciones válidas e inválidas y control del actor.
- [ ] `puedeOperarComoAdmin`: verdadero solo con `ADMIN` + `VERIFICADO`.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 9. Validación final

- [ ] `docker compose up -d` y base `healthy` (publicada en 5435).
- [ ] `pnpm db:migrate` aplicada y `pnpm db:seed` con `SUPERADMIN` sembrado.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: registrar `ADMIN` (queda `PENDIENTE`, no opera), aprobar desde la bandeja y
      comprobar que opera; rechazar otro y comprobar bloqueo; bandeja del superadmin inaccesible para
      los demás roles.

## 10. Cierre

- [ ] `usuarios/domain` y `usuarios/application` puras (sin framework/Prisma/Auth.js); ESLint OK.
- [ ] Revisar que la spec de la 002 refleje el seed de `SUPERADMIN` y el registro público de `ADMIN`.
- [ ] Verificar que `DOC/features/015-superadmin-y-registro-de-administradores.md` refleja lo
      entregado.
- [ ] Mover `015` a **Hecho ✅** en `constitution/roadmap.md` y dejar lista la base para `016 · Perfil
      de administrador y centro de acopio`.
