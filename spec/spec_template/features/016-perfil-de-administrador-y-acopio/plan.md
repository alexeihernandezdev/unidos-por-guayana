# 016 · Perfil de administrador y centro de acopio: Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

Construir de **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación),
extendiendo el módulo `src/modules/usuarios` que ya alberga la identidad de cuenta (features 002 y
015). Orden: **modelo `PerfilAdmin` + relación `adminId` + migración → dominio/aplicación →
repositorio Prisma (infra) → integración con el registro público y la bandeja del superadmin (015)
→ vista/edición del perfil del admin → tests**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). Esta versión trae cambios importantes.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma` añadir:
  - `enum TipoDocumento { JURIDICO NATURAL }`.
  - `model PerfilAdmin { id, usuarioId @unique (FK a Usuario), nombreCuenta, estado, parroquia, telefono, correo, tipoDocumento TipoDocumento, numeroDocumento, createdAt, updatedAt }`.
  - Relación uno a uno `Usuario 1 a 1 PerfilAdmin` (el `PerfilAdmin` solo aplica a cuentas `ADMIN`;
    la regla "solo `ADMIN`" la asegura la aplicación, ya que Prisma no restringe por valor de enum).
  - Declarar el lado admin de la relación con `PuntoAcopio`: `adminId` (uno a muchos). El modelo
    `PuntoAcopio` completo lo crea la feature 011; aquí solo se prevé la clave foránea para no
    re-migrar.
- Correr `pnpm db:migrate` (con el Postgres de Docker arriba) → migración que crea `PerfilAdmin`,
  el enum y la FK `adminId`.

## 2. Capa de dominio (`src/modules/usuarios/domain`): pura

- Tipo/entidad `PerfilAdmin` y el enum `TipoDocumento` (independientes de Prisma).
- Contrato `PerfilAdminRepository` (p. ej. `crear`, `buscarPorUsuarioId`, `actualizar`).
- Reglas de dominio puras:
  - `tipoDocumento` debe ser `JURIDICO` o `NATURAL` y `numeroDocumento` no vacío.
  - Un `Usuario` tiene como máximo un `PerfilAdmin`.
  - Función de herencia de ubicación: dado un `PerfilAdmin`, devolver los valores por defecto
    (`estado`, `parroquia`) que un `PuntoAcopio` nuevo tomaría (la consumirá la feature 011).
- Sin imports de framework ni Prisma (ESLint lo impide).

## 3. Capa de aplicación (`src/modules/usuarios/application`): pura

- Caso de uso `crearPerfilAdmin(input)`:
  - Valida los campos (documento con tipo y número, correo/teléfono no vacíos).
  - Verifica que no exista ya un `PerfilAdmin` para ese `usuarioId` (vía repositorio).
  - Crea el `PerfilAdmin` asociado a la cuenta.
- Caso de uso `actualizarPerfilAdmin(usuarioId, cambios)`: carga el perfil y aplica cambios
  validados.
- Caso de uso `obtenerPerfilAdmin(usuarioId)`: para la vista del admin y la bandeja del superadmin.
- Depende solo de `domain`. Es el mejor sitio para los tests unitarios.

## 4. Infraestructura (`src/modules/usuarios/infrastructure`)

- `PrismaPerfilAdminRepository` implementa `PerfilAdminRepository` con el cliente de
  `src/lib/prisma.ts` (crear, buscar por `usuarioId`, actualizar).
- Mapeo entre el registro de Prisma y la entidad de dominio (sin filtrar tipos de Prisma hacia el
  dominio).

## 5. Presentación (`src/modules/usuarios/ui` + `src/app`)

- **Registro público de admin (feature 015):** extender el formulario de alta de administrador con
  los campos del perfil (`nombreCuenta`, `estado`, `parroquia`, `telefono`, `correo`,
  `tipoDocumento`, número). El server action que crea la cuenta `ADMIN` en `PENDIENTE` invoca
  también `crearPerfilAdmin`.
- **Bandeja de aprobación del superadmin (feature 015):** mostrar los datos del `PerfilAdmin`
  (vía `obtenerPerfilAdmin`) en el detalle de cada cuenta pendiente.
- **Perfil del admin:** página de área de gestión (p. ej. `/panel/perfil`) que lee y permite
  editar el perfil con **React Hook Form**; la edición llama a `actualizarPerfilAdmin`.
- Componentes de formulario en `src/modules/usuarios/ui` (PascalCase `*.tsx`). Selector de
  `tipoDocumento` como opción `JURIDICO` / `NATURAL`.

## 6. Relación con el punto de acopio (frontera con 011)

- Declarar el lado `adminId` en el esquema y una función de dominio que exponga los valores de
  ubicación por defecto (`estado`, `parroquia`) del `PerfilAdmin`.
- **No** implementar el CRUD de `PuntoAcopio` aquí: la feature 011 lo consumirá para prellenar la
  ubicación de un punto nuevo con esos valores por defecto.

## 7. Tests (Vitest)

- `crearPerfilAdmin`: crea un perfil válido; rechaza documento sin tipo o sin número; rechaza
  correo/teléfono vacíos; rechaza un segundo perfil para el mismo `usuarioId`. Con dobles (mocks)
  de `PerfilAdminRepository` (sin tocar la base real).
- `actualizarPerfilAdmin`: aplica cambios válidos; rechaza cambios inválidos.
- Función de herencia de ubicación: devuelve `estado`/`parroquia` del perfil.
- Tests colocados (`*.test.ts`) junto a cada caso de uso.

## Decisiones

- **`PerfilAdmin` en `usuarios`, no en `acopio`:** es una extensión uno a uno de la cuenta `ADMIN`
  y su ciclo de vida va atado al registro y la aprobación (features 002/015), que viven en
  `usuarios`. El módulo `acopio` (011) posee `PuntoAcopio` y consume la relación `adminId`.
- **Documento como tipo + número:** admite jurídico y natural sin duplicar campos ni tablas.
- **Herencia de ubicación por defecto, no copia rígida:** el `PuntoAcopio` puede sobrescribir
  estado/parroquia; el `PerfilAdmin` solo aporta el valor inicial.
- **FK `adminId` prevista desde ya:** se declara el lado admin para no re-migrar cuando la 011 cree
  `PuntoAcopio`.
- **Dominio/aplicación agnósticos de Prisma:** el repositorio es un adaptador; la validación del
  perfil es pura y testeable.

## Validación final

1. `docker compose up -d` (base arriba).
2. `pnpm db:migrate`: migración aplicada (`PerfilAdmin`, enum `TipoDocumento`, FK `adminId`).
3. `pnpm test` (casos de uso en verde).
4. `pnpm lint` / `pnpm build` sin errores.
5. `pnpm dev`: registrar un admin completando el perfil, ver los datos en la bandeja del
   superadmin al aprobar, y editar el perfil como admin aprobado.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `016 · Perfil de administrador y centro de acopio` a
  **Hecho ✅**.
- Verificar que `DOC/features/016-perfil-de-administrador-y-acopio.md` refleja lo entregado.
- Anotar en la feature 011 (`Puntos de acopio`) que la relación `adminId` y la herencia de
  ubicación ya están disponibles.
