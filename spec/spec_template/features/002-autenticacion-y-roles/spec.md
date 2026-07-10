# 002 · Autenticación y roles

> Estado: **Pendiente** · Depende de: `001 · Configuración base` · Roadmap: `constitution/roadmap.md`

> **Enmendada por `015`.** Desde la feature 015 el modelo base cambió: existe el rol `SUPERADMIN`
> (raíz de confianza) y el seed (`pnpm db:seed`) siembra un `SUPERADMIN` en lugar de un `ADMIN`.
> El `ADMIN` ya **no** es cerrado: es de **registro público**, pero la cuenta nace en
> `estadoVerificacion = PENDIENTE` y no opera hasta que el `SUPERADMIN` la aprueba (`VERIFICADO`) o la
> rechaza. Lo que este documento dice sobre «`ADMIN` no auto-asignable» y el «`ADMIN` sembrado» queda
> reemplazado por lo descrito en `features/015-superadmin-y-registro-de-administradores/`.

## Qué hace

Da a la plataforma **registro, inicio de sesión y control de acceso por rol**. Es la primera
feature que introduce el modelo `Usuario` en la base de datos y protege el resto de la app
según quién eres:

- **Registro** — una persona se da de alta con email y contraseña y elige su rol:
  `COLABORADOR` o `SOLICITANTE`. El rol `ADMIN` **no** es auto-asignable.
- **Inicio / cierre de sesión** — autenticación por credenciales (email + contraseña), con la
  sesión guardando el rol del usuario.
- **Control de acceso por rol** — cada ruta o acción se habilita según el rol
  (`ADMIN` / `COLABORADOR` / `SOLICITANTE`); las rutas protegidas redirigen a login si no hay
  sesión, y las acciones de un rol se bloquean para los demás.

## Por qué

`mission.md` define tres tipos de usuario con permisos distintos: solo el `ADMIN` gestiona
Ayudas, el `COLABORADOR` aporta y el `SOLICITANTE` pide ayuda. Sin autenticación y roles, ninguna
feature posterior (ayudas, aportes, solicitudes, panel de administración) puede aplicar sus
reglas de permisos. Esta feature es la base de seguridad sobre la que se apoya todo el flujo.

## Decisiones tomadas

- **Estrategia de auth:** Auth.js (NextAuth v5) con adapter de Prisma y **provider de
  credenciales** (email/contraseña). El rol viaja en la sesión.
- **Asignación de roles:** auto-registro solo para `COLABORADOR` y `SOLICITANTE`. El `ADMIN` se
  crea por *seed* o lo promueve otro `ADMIN`; el registro público rechaza cualquier intento de
  auto-asignarse `ADMIN`.

## Alcance

**Incluye**

- Modelo `Usuario` en Prisma: `email` (único), `passwordHash`, `nombre`, `rol`
  (`ADMIN` | `COLABORADOR` | `SOLICITANTE`) y `estadoVerificacion`
  (`PENDIENTE` | `VERIFICADO` | `RECHAZADO`, por defecto `PENDIENTE`).
- Tablas que requiera el adapter de Auth.js (según estrategia de sesión elegida).
- Primera **migración** de Prisma (crea las tablas anteriores) y un **seed** que da de alta un
  `ADMIN` inicial.
- Hash de contraseñas (nunca se guardan en claro).
- Flujo de **registro** (formulario + validación) que crea el `Usuario` con rol permitido.
- Flujo de **login / logout** con Auth.js.
- **Protección de rutas y control por rol**: middleware/guards que redirigen a login sin sesión
  y restringen por rol; un helper para leer el usuario/rol actual en servidor.
- Estructura del módulo `src/modules/usuarios/` (domain / application / infrastructure / ui) y la
  configuración de Auth.js en `src/lib`.
- Tests (Vitest) de los casos de uso: registro rechaza `ADMIN`, la contraseña se hashea, y las
  credenciales inválidas se rechazan.

**No incluye**

- **Verificación de usuarios** (validar colaboradores/solicitantes que aportan camión o piden
  ayuda): es la feature `013`. Aquí `estadoVerificacion` nace en `PENDIENTE` y no bloquea el uso.
- Recuperación de contraseña, verificación de email, OAuth/redes sociales (fuera de alcance de
  esta feature; se pueden añadir después).
- Pantallas de negocio (landing, panel de admin, ayudas…): esta feature solo entrega auth y una
  protección mínima demostrable.
- Gestión avanzada de perfil de usuario.

## Criterios de aceptación

- [ ] Una persona puede **registrarse** eligiendo `COLABORADOR` o `SOLICITANTE` y queda creada en
      la base con su rol.
- [ ] El registro **rechaza** cualquier intento de auto-asignarse `ADMIN` (validado en servidor,
      no solo en el formulario).
- [ ] Las contraseñas se guardan **hasheadas**; nunca en texto plano.
- [ ] Con credenciales válidas el usuario **inicia sesión** y la sesión expone su `rol`; con
      credenciales inválidas se rechaza con un mensaje claro.
- [ ] El usuario puede **cerrar sesión**.
- [ ] Una **ruta protegida** redirige a login cuando no hay sesión.
- [ ] El **control por rol** funciona: una ruta/acción marcada solo para `ADMIN` no es accesible
      por `COLABORADOR` ni `SOLICITANTE` (demostrado con una ruta de ejemplo).
- [ ] La **migración** crea las tablas y el **seed** deja un `ADMIN` inicial que puede iniciar
      sesión.
- [ ] `pnpm test` cubre: rechazo de `ADMIN` en registro, hash de contraseña y rechazo de
      credenciales inválidas — en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `usuarios/domain` y `usuarios/application`
      permanecen **puras** (sin framework ni Auth.js/Prisma).

## Notas y riesgos

- **Dependencias nuevas (avisar):** `next-auth@beta` (v5) + `@auth/prisma-adapter`, y una
  librería de hash (`bcryptjs` o `argon2`). Confirmar antes de instalar (límite duro de la
  constitución). Posible `zod` para validar el registro en el límite; si se añade, avisar.
- **Credenciales + estrategia de sesión:** el provider de credenciales de Auth.js v5 suele exigir
  sesión **JWT** (las sesiones en base de datos no aplican directo con credentials); en ese caso
  el rol se embebe en el token. Verificar contra la guía vigente.
- **Next 16:** middleware, route handlers (`/api/auth/[...]`) y server components cambian respecto
  a versiones previas — leer `node_modules/next/dist/docs/` antes de codificar (AGENTS.md).
- **Pureza de capas:** Auth.js, Prisma y el hashing son infraestructura; el dominio solo define la
  entidad `Usuario`, el enum de rol y los contratos. ESLint hace cumplir esta dirección.
- **`estadoVerificacion`:** se modela ya para no re-migrar en la feature 013, pero su gestión real
  (aprobar/rechazar) queda fuera de esta feature.
