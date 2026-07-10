# 015 · Rol SUPERADMIN y registro público de administradores: Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros). Enmienda la feature 002.

## Enfoque general

Construir de **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación) sobre
lo que dejó la feature 002 (módulo `src/modules/usuarios`, Auth.js, seed, protección por rol). El
grueso del trabajo es **ampliar y enmendar** lo existente, no crear un módulo nuevo. Orden:
**ampliar enum + migración → dominio (rol y transiciones) → aplicación (registro público de admin +
aprobar/rechazar) → infraestructura (repo + guard + seed) → UI (registro admin + bandeja del
superadmin) → enforcement → tests**.

> ⚠️ Antes de tocar proxy (antes middleware), route handlers o server actions de Next 16, leer la
> guía en `node_modules/next/dist/docs/` (AGENTS.md). Esta versión trae cambios importantes.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma` ampliar `enum Rol { SUPERADMIN ADMIN COLABORADOR SOLICITANTE }`.
- No se añaden campos nuevos al `Usuario`: `estadoVerificacion` (de la 002) ya cubre
  `PENDIENTE` | `VERIFICADO` | `RECHAZADO`.
- Correr `pnpm db:migrate` → migración aditiva que añade el valor `SUPERADMIN` al enum.
- Si existiera un `ADMIN` sembrado por la 002, decidir en el seed (paso 6) si se recrea como
  `SUPERADMIN`.

## 2. Capa de dominio (`src/modules/usuarios/domain`): pura

- Ampliar el tipo/enum `Rol` con `SUPERADMIN`.
- **Roles auto-registrables:** actualizar `esRolAutoRegistrable` para que acepte `ADMIN`,
  `COLABORADOR` y `SOLICITANTE`, y **rechace** `SUPERADMIN`.
- **Transiciones de verificación:** función pura que valida el paso de `estadoVerificacion` desde
  `PENDIENTE` hacia `VERIFICADO` o `RECHAZADO` (no se aprueba lo ya aprobado ni se salta a otro
  estado inválido).
- **Regla de operatividad:** predicado `puedeOperarComoAdmin(usuario)` = `rol === ADMIN` y
  `estadoVerificacion === VERIFICADO`. Punto único de verdad para el enforcement.
- Sin imports de framework, Prisma ni Auth.js (ESLint lo impide).

## 3. Capa de aplicación (`src/modules/usuarios/application`): pura

- **Enmendar `registrarUsuario`:** ya no rechaza `ADMIN`; cuando el rol es `ADMIN`, crea la cuenta
  con `estadoVerificacion = PENDIENTE`. Sigue rechazando `SUPERADMIN` (no auto-registrable).
- **Caso de uso `aprobarAdmin(adminId, superadminId)`:** verifica que el actor sea `SUPERADMIN`,
  que la cuenta objetivo sea `ADMIN` en `PENDIENTE`, y aplica la transición a `VERIFICADO`.
- **Caso de uso `rechazarAdmin(adminId, superadminId)`:** análogo, transición a `RECHAZADO`.
- **Caso de uso `listarAdminsPendientes()`:** devuelve las cuentas `ADMIN` en `PENDIENTE` para la
  bandeja.
- **Guardia de operatividad reutilizable:** helper de aplicación que envuelve las acciones de
  administración y falla si `puedeOperarComoAdmin` es falso.
- Depende solo de `domain`. Es el mejor sitio para los tests unitarios.

## 4. Infraestructura (`src/modules/usuarios/infrastructure` + `src/lib`)

- Ampliar `PrismaUsuarioRepository` con: `listarPorRolYEstado` (o `listarAdminsPendientes`) y
  `actualizarEstadoVerificacion(id, estado)`.
- **`src/lib/auth.ts`:** el rol ya viaja en el token/sesión; verificar que `SUPERADMIN` se propaga
  igual que los demás roles. Si se opta por leer `estadoVerificacion` fresco de base en acciones
  sensibles, exponer un helper que lo consulte.
- Tipado de sesión de Auth.js: confirmar que `rol` admite el nuevo valor.

## 5. Presentación (`src/modules/usuarios/ui` + `src/app`)

- **Registro:** la página/flujo de registro de la 002 admite ahora `ADMIN` como opción pública; el
  server action delega en el `registrarUsuario` enmendado. Un `ADMIN` recién registrado ve un aviso
  de "cuenta pendiente de aprobación".
- **Bandeja del superadmin:** ruta protegida solo-`SUPERADMIN` (p. ej. `/superadmin/admins`) que
  lista las cuentas `ADMIN` en `PENDIENTE` con acciones **aprobar** / **rechazar** (server actions
  que llaman a `aprobarAdmin` / `rechazarAdmin`).
- Componentes en `src/modules/usuarios/ui` (PascalCase `*.tsx`); primitivos de `src/shared/ui`.

## 6. Enforcement por estado

- **Guard de servidor `requireAdminVerificado()`** (junto a `requireRol()` de la 002): exige sesión,
  rol `ADMIN` y `estadoVerificacion === VERIFICADO`; si no, redirige o responde bloqueado. Las rutas
  y acciones de administración (panel, ayudas, recursos, aportes) lo usan.
- **Guard `requireRol("SUPERADMIN")`** para la bandeja del superadmin.
- El proxy (antes middleware) protege el prefijo de superadmin; el chequeo fino de estado vive en el
  guard de servidor y en los casos de uso (doble candado).

## 7. Seed de SUPERADMIN (enmienda del seed de la 002)

- `prisma/seed.ts` pasa a crear/actualizar un **`SUPERADMIN`** inicial con contraseña hasheada,
  tomando credenciales de variables de entorno (documentadas en `.env.example`, nunca en claro).
- Ya no siembra un `ADMIN`: los administradores se registran públicamente.
- Comando: `pnpm db:seed` (idempotente, como en la 002).

## 8. Tests (Vitest)

- `registrarUsuario`: admite `ADMIN` y lo crea en `PENDIENTE`; sigue rechazando `SUPERADMIN`;
  mantiene el rechazo de email duplicado y el hash.
- `aprobarAdmin` / `rechazarAdmin`: transición válida desde `PENDIENTE`; rechazo si el objetivo no es
  `ADMIN` o no está `PENDIENTE`; rechazo si el actor no es `SUPERADMIN`.
- `puedeOperarComoAdmin`: verdadero solo para `ADMIN` + `VERIFICADO`; falso en `PENDIENTE`/`RECHAZADO`.
- Tests colocados (`*.test.ts`) junto a cada caso de uso, con dobles (mocks) del repositorio.

## Decisiones

- **Ampliar el módulo `usuarios`, no crear uno nuevo:** el `SUPERADMIN` y la aprobación de admins son
  parte del dominio de usuarios y su verificación; reutilizan repositorio, sesión y guards de la 002.
- **Estado fresco de base en acciones de administración:** para que una aprobación surta efecto sin
  re-login, las acciones sensibles consultan `estadoVerificacion` en base, no solo en la sesión.
- **Punto único de verdad (`puedeOperarComoAdmin`):** evita que cada acción de administración futura
  reimplemente el chequeo y se olvide del estado.
- **Seed de `SUPERADMIN`:** la raíz de confianza no puede depender de otra cuenta previa; los admins
  se registran después de forma pública y los aprueba el superadmin.

## Validación final

1. `docker compose up -d` (base arriba).
2. `pnpm db:migrate`: migración del enum aplicada.
3. `pnpm db:seed`: `SUPERADMIN` sembrado.
4. `pnpm test` (casos de uso en verde).
5. `pnpm lint` / `pnpm build` sin errores.
6. `pnpm dev`: registrar un `ADMIN` (queda `PENDIENTE` y no opera), aprobarlo desde la bandeja del
   `SUPERADMIN`, comprobar que ya opera; rechazar otro y comprobar que sigue bloqueado; verificar que
   la bandeja del superadmin bloquea a los demás roles.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `015 · Rol SUPERADMIN y registro público de
  administradores` a **Hecho ✅** y anotar la enmienda a la feature 002.
- Revisar que la feature 002 (`spec/features/002-…`) refleje que el seed ahora crea `SUPERADMIN` y
  que `ADMIN` es de registro público.
- Verificar que `DOC/features/015-superadmin-y-registro-de-administradores.md` refleja lo entregado.
