# 002 · Autenticación y roles — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

Construir de **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación),
apoyándose en lo que dejó la feature 001 (Prisma, Docker, Vitest, RHF). Orden:
**modelo `Usuario` + migración → dominio/aplicación → Auth.js + hashing (infra) → UI de
registro/login → protección por rol → seed → tests**.

> ⚠️ Antes de tocar middleware, route handlers o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). Esta versión trae cambios importantes.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma` añadir:
  - `enum Rol { ADMIN COLABORADOR SOLICITANTE }`
  - `enum EstadoVerificacion { PENDIENTE VERIFICADO RECHAZADO }`
  - `model Usuario { id, email @unique, passwordHash, nombre, rol Rol, estadoVerificacion EstadoVerificacion @default(PENDIENTE), createdAt, updatedAt }`
  - Las tablas que pida el adapter de Auth.js según la estrategia (con sesión JWT, los modelos
    `Account`/`Session` pueden no ser necesarios; incluir solo lo que el adapter requiera).
- Correr `prisma migrate dev` (con el Postgres de Docker arriba) → **primera migración real** del
  proyecto.

## 2. Capa de dominio (`src/modules/usuarios/domain`) — pura

- Tipo/entidad `Usuario` y el enum `Rol` (independientes de Prisma).
- Contrato `UsuarioRepository` (p. ej. `crear`, `buscarPorEmail`).
- Contrato `PasswordHasher` (`hash`, `verificar`) — interfaz, sin implementación.
- Regla de dominio: los **roles auto-registrables** son solo `COLABORADOR` y `SOLICITANTE`
  (constante/función de dominio que la aplicación consulta).
- Sin imports de framework, Prisma ni Auth.js (ESLint lo impide).

## 3. Capa de aplicación (`src/modules/usuarios/application`) — pura

- Caso de uso `registrarUsuario(input)`:
  - Valida que el rol pedido sea auto-registrable → si es `ADMIN`, **rechaza**.
  - Verifica email no duplicado (vía `UsuarioRepository`).
  - Hashea la contraseña (vía `PasswordHasher`) y crea el `Usuario`.
- Caso de uso `validarCredenciales(email, password)` para que lo use el provider de Auth.js:
  busca por email y verifica el hash; devuelve el usuario (con rol) o null.
- Depende solo de `domain`. Es el mejor sitio para los tests unitarios.

## 4. Infraestructura (`src/modules/usuarios/infrastructure` + `src/lib`)

- `PrismaUsuarioRepository` implementa `UsuarioRepository` con el cliente de `src/lib/prisma.ts`.
- `BcryptPasswordHasher` (o argon2) implementa `PasswordHasher`.
- `src/lib/auth.ts` — configuración de **Auth.js v5**:
  - Adapter de Prisma.
  - **Credentials provider** cuyo `authorize` delega en `validarCredenciales` (aplicación).
  - **Sesión JWT**: en `callbacks.jwt` inyectar `rol` (y `id`) al token; en `callbacks.session`
    exponerlos en `session.user`.
  - Exportar `handlers`, `auth`, `signIn`, `signOut`.
- Tipado: extender los tipos de sesión de Auth.js para incluir `rol`.

## 5. Presentación (`src/modules/usuarios/ui` + `src/app`)

- Route handler `src/app/api/auth/[...nextauth]/route.ts` re-exportando `handlers`.
- Páginas `src/app/(auth)/login` y `.../registro` con formularios **client component** usando
  **React Hook Form** (instalado en 001). Validación en el límite (opcional `zod` + resolver;
  avisar si se añade).
- Componentes de formulario en `src/modules/usuarios/ui` (PascalCase `*.tsx`).
- El registro llama a un **server action** (o route handler) que ejecuta `registrarUsuario`; el
  login usa `signIn("credentials", …)`.

## 6. Protección por rol

- `middleware.ts` (raíz o `src/`) usando el `auth` de Auth.js para exigir sesión en rutas
  protegidas y redirigir a `/login`.
- Helper en servidor `getUsuarioActual()` / `requireRol(rol)` para server components y actions.
- Ruta de ejemplo solo-`ADMIN` (p. ej. `/(admin)/panel` placeholder) para **demostrar** el gate;
  el panel real es la feature 008.

## 7. Seed de ADMIN

- Script de seed de Prisma (`prisma/seed.ts`) que crea un `ADMIN` inicial con contraseña
  hasheada, tomando credenciales de variables de entorno (documentadas en `.env.example`, nunca
  en claro en el repo).
- Configurar el comando de seed en `package.json` / `prisma`.

## 8. Tests (Vitest)

- `registrarUsuario`: rechaza `ADMIN`; hashea la contraseña; rechaza email duplicado. Con dobles
  (mocks) de `UsuarioRepository` y `PasswordHasher` — sin tocar la base real.
- `validarCredenciales`: acepta credenciales correctas, rechaza incorrectas.
- Tests colocados (`*.test.ts`) junto a cada caso de uso.

## Decisiones

- **Sesión JWT con rol embebido:** compatible con el provider de credenciales de Auth.js v5 y
  evita un round-trip a la base por request para conocer el rol.
- **Dominio/aplicación agnósticos de Auth.js y Prisma:** el `authorize` de Auth.js y el repo
  Prisma son adaptadores; la lógica de registro/validación es pura y testeable.
- **`estadoVerificacion` desde ya:** se modela para no re-migrar en la feature 013; su gestión no
  entra aquí.
- **Seed en vez de UI de creación de ADMIN:** el primer `ADMIN` no puede depender de un `ADMIN`
  previo; nuevos admins se promueven después.

## Validación final

1. `docker compose up -d` (base arriba).
2. `npx prisma migrate dev` — migración aplicada.
3. `npm run test` (casos de uso en verde).
4. `npm run lint` / `npm run build` sin errores.
5. `npm run dev` — registrar un colaborador, iniciar/cerrar sesión, y comprobar que la ruta
   solo-`ADMIN` bloquea a un no-admin y deja pasar al `ADMIN` sembrado.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `002 · Autenticación y roles` a **Hecho ✅** y
  promover `003 · Landing` a **Siguiente 🔜**.
- Verificar que `DOC/features/002-autenticacion-y-roles.md` refleja lo entregado.
