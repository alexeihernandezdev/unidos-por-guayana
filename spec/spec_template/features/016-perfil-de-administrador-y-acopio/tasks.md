# 016 · Perfil de administrador y centro de acopio: Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Confirmar que la feature `015 · Rol SUPERADMIN y registro público de administradores` está
      integrada (registro público de admin y bandeja de aprobación disponibles).
- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, server
      components, formularios).
- [ ] Confirmar dependencias: `zod` ya disponible para validar en el límite; no se prevén nuevas
      (avisar si hiciera falta alguna).
- [ ] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [ ] Añadir a `schema.prisma`: enum `TipoDocumento { JURIDICO NATURAL }`.
- [ ] Añadir modelo `PerfilAdmin` (relación uno a uno con `Usuario` vía `usuarioId` único;
      `nombreCuenta`, `estado`, `parroquia`, `telefono`, `correo`, `tipoDocumento`,
      `numeroDocumento`, `createdAt`, `updatedAt`).
- [ ] Declarar el lado admin de la relación con `PuntoAcopio` (`adminId`, uno a muchos). El modelo
      `PuntoAcopio` completo es de la feature 011; aquí solo se prevé la FK.
- [ ] `pnpm db:migrate`: migración que crea `PerfilAdmin`, el enum y la FK `adminId`.

## 2. Dominio (`src/modules/usuarios/domain`)

- [ ] Entidad/tipo `PerfilAdmin` y enum `TipoDocumento` (sin Prisma ni framework).
- [ ] Contrato `PerfilAdminRepository` (`crear`, `buscarPorUsuarioId`, `actualizar`).
- [ ] Regla: documento válido = `tipoDocumento` ∈ `JURIDICO` | `NATURAL` y `numeroDocumento` no
      vacío.
- [ ] Regla: un `Usuario` tiene como máximo un `PerfilAdmin`.
- [ ] Función de herencia de ubicación por defecto (`estado`, `parroquia`) para un `PuntoAcopio`
      nuevo (la consumirá la feature 011).

## 3. Aplicación (`src/modules/usuarios/application`)

- [ ] Caso de uso `crearPerfilAdmin` (valida campos, evita perfil duplicado, crea).
- [ ] Caso de uso `actualizarPerfilAdmin` (carga y aplica cambios validados).
- [ ] Caso de uso `obtenerPerfilAdmin` (para la vista del admin y la bandeja del superadmin).
- [ ] Capa pura (solo depende de `domain`); lo verifica ESLint.

## 4. Infraestructura

- [ ] `PrismaPerfilAdminRepository` sobre `src/lib/prisma.ts` (crear, buscar por `usuarioId`,
      actualizar).
- [ ] Mapeo Prisma ↔ entidad de dominio (sin filtrar tipos de Prisma al dominio).

## 5. Presentación

- [ ] Extender el **registro público de admin** (feature 015) con los campos del perfil; el server
      action que crea la cuenta `ADMIN` en `PENDIENTE` invoca también `crearPerfilAdmin`.
- [ ] Mostrar los datos del `PerfilAdmin` en la **bandeja de aprobación del superadmin**
      (feature 015) vía `obtenerPerfilAdmin`.
- [ ] Página de **perfil del admin** (p. ej. `/panel/perfil`): ver y editar con React Hook Form →
      `actualizarPerfilAdmin`.
- [ ] Componentes de formulario en `src/modules/usuarios/ui` (PascalCase), con selector
      `JURIDICO` / `NATURAL`.

## 6. Frontera con la feature 011

- [ ] Declarada la relación `adminId` y expuesta la función de herencia de ubicación por defecto.
- [ ] **No** implementar el CRUD de `PuntoAcopio` (es la feature 011); solo dejar lista la
      relación y la herencia.

## 7. Tests (Vitest)

- [ ] `crearPerfilAdmin`: crea perfil válido; rechaza documento sin tipo/número; rechaza
      correo/teléfono vacíos; rechaza segundo perfil para el mismo `usuarioId`.
- [ ] `actualizarPerfilAdmin`: aplica cambios válidos; rechaza inválidos.
- [ ] Función de herencia de ubicación: devuelve `estado`/`parroquia` del perfil.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: registrar admin con perfil, verlo en la bandeja del superadmin al aprobar, y
      editarlo como admin aprobado.

## 9. Cierre

- [ ] `usuarios/domain` y `usuarios/application` puras (sin framework/Prisma); ESLint OK.
- [ ] Verificar que `DOC/features/016-perfil-de-administrador-y-acopio.md` refleja lo entregado.
- [ ] Mover `016 · Perfil de administrador y centro de acopio` a **Hecho ✅** en
      `constitution/roadmap.md`.
- [ ] Anotar en la feature 011 que la relación `adminId` y la herencia de ubicación ya están
      disponibles.
