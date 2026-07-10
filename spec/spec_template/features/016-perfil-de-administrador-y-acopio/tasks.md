# 016 · Perfil de administrador y centro de acopio: Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [x] Confirmar que la feature `015 · Rol SUPERADMIN y registro público de administradores` está
      integrada (registro público de admin y bandeja de aprobación disponibles).
- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, server
      components, formularios).
- [x] Confirmar dependencias: `zod` ya disponible para validar en el límite; no se prevén nuevas
      (avisar si hiciera falta alguna).
- [x] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [x] Añadir a `schema.prisma`: enum `TipoDocumento { JURIDICO NATURAL }`.
- [x] Añadir modelo `PerfilAdmin` (relación uno a uno con `Usuario` vía `usuarioId` único;
      `nombreCuenta`, `estado`, `parroquia`, `telefono`, `correo`, `tipoDocumento`,
      `numeroDocumento`, `createdAt`, `updatedAt`).
- [x] Declarar el lado admin de la relación con `PuntoAcopio` (`adminId`, uno a muchos). El modelo
      `PuntoAcopio` completo es de la feature 011; aquí solo se prevé la FK.
- [x] `pnpm db:migrate`: migración que crea `PerfilAdmin`, el enum y la FK `adminId`.

## 2. Dominio (`src/modules/usuarios/domain`)

- [x] Entidad/tipo `PerfilAdmin` y enum `TipoDocumento` (sin Prisma ni framework).
- [x] Contrato `PerfilAdminRepository` (`crear`, `buscarPorUsuarioId`, `actualizar`).
- [x] Regla: documento válido = `tipoDocumento` ∈ `JURIDICO` | `NATURAL` y `numeroDocumento` no
      vacío.
- [x] Regla: un `Usuario` tiene como máximo un `PerfilAdmin`.
- [x] Función de herencia de ubicación por defecto (`estado`, `parroquia`) para un `PuntoAcopio`
      nuevo (la consumirá la feature 011).

## 3. Aplicación (`src/modules/usuarios/application`)

- [x] Caso de uso `crearPerfilAdmin` (valida campos, evita perfil duplicado, crea).
- [x] Caso de uso `actualizarPerfilAdmin` (carga y aplica cambios validados).
- [x] Caso de uso `obtenerPerfilAdmin` (para la vista del admin y la bandeja del superadmin).
- [x] Capa pura (solo depende de `domain`); lo verifica ESLint.

## 4. Infraestructura

- [x] `PrismaPerfilAdminRepository` sobre `src/lib/prisma.ts` (crear, buscar por `usuarioId`,
      actualizar).
- [x] Mapeo Prisma ↔ entidad de dominio (sin filtrar tipos de Prisma al dominio).

## 5. Presentación

- [x] Extender el **registro público de admin** (feature 015) con los campos del perfil; el server
      action que crea la cuenta `ADMIN` en `PENDIENTE` invoca también `crearPerfilAdmin`.
- [x] Mostrar los datos del `PerfilAdmin` en la **bandeja de aprobación del superadmin**
      (feature 015) vía `obtenerPerfilAdmin`.
- [x] Página de **perfil del admin** (p. ej. `/panel/perfil`): ver y editar con React Hook Form →
      `actualizarPerfilAdmin`.
- [x] Componentes de formulario en `src/modules/usuarios/ui` (PascalCase), con selector
      `JURIDICO` / `NATURAL`.

## 6. Frontera con la feature 011

- [x] Declarada la relación `adminId` y expuesta la función de herencia de ubicación por defecto.
- [x] **No** implementar el CRUD de `PuntoAcopio` (es la feature 011); solo dejar lista la
      relación y la herencia.

## 7. Tests (Vitest)

- [x] `crearPerfilAdmin`: crea perfil válido; rechaza documento sin tipo/número; rechaza
      correo/teléfono vacíos; rechaza segundo perfil para el mismo `usuarioId`.
- [x] `actualizarPerfilAdmin`: aplica cambios válidos; rechaza inválidos.
- [x] Función de herencia de ubicación: devuelve `estado`/`parroquia` del perfil.
- [x] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [x] `docker compose up -d` y base `healthy`.
- [x] `pnpm db:migrate` aplicada.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: registrar admin con perfil, verlo en la bandeja del superadmin al aprobar, y
      editarlo como admin aprobado.

## 9. Cierre

- [x] `usuarios/domain` y `usuarios/application` puras (sin framework/Prisma); ESLint OK.
- [x] Verificar que `DOC/features/016-perfil-de-administrador-y-acopio.md` refleja lo entregado.
- [x] Mover `016 · Perfil de administrador y centro de acopio` a **Hecho ✅** en
      `constitution/roadmap.md`.
- [x] Anotar en la feature 011 que la relación `adminId` y la herencia de ubicación ya están
      disponibles.
