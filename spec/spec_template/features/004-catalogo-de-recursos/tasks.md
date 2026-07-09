# 004 · Catálogo de recursos — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar el patrón del módulo `usuarios` (feature 002).
- [x] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [x] Añadir a `schema.prisma`: enum `CategoriaRecurso` y modelo `Recurso` (`nombre` único, `unidad`,
      `categoria`, `descripcion?`, `activo` por defecto `true`, timestamps, `@@map("recursos")`).
- [x] `pnpm db:migrate` — migración `add_recursos` aplicada sin errores.

## 2. Dominio (`src/modules/recursos/domain`)

- [x] Enum `CategoriaRecurso` (const-object + unión, mismos valores que Prisma).
- [x] Entidad `Recurso` y tipos `NuevoRecurso` / `CambiosRecurso`.
- [x] Contrato `RecursoRepository` (`crear`, `listar`, `buscarPorId`, `buscarPorNombre`, `actualizar`).
- [x] Reglas puras: `normalizarNombre` (trim) y validaciones (nombre/unidad no vacíos, categoría válida).

## 3. Aplicación (`src/modules/recursos/application`)

- [x] `crearRecurso` (normaliza, valida, rechaza duplicado, crea).
- [x] `listarRecursos` (filtro por categoría / solo activos).
- [x] `editarRecurso` (revalida unicidad al renombrar sin chocar consigo mismo).
- [x] `archivarRecurso` / `activarRecurso`.
- [x] Errores de aplicación (`NombreDuplicadoError`, `RecursoNoEncontradoError`).
- [x] Mantener la capa pura (solo depende de `domain`).

## 4. Infraestructura

- [x] `PrismaRecursoRepository` sobre `@/lib/prisma` (mapeo sin casts; búsqueda por nombre
      insensible a mayúsculas con `mode: "insensitive"`).

## 5. Presentación (solo `ADMIN`)

- [x] Ruta **listado** `/(admin)/panel/recursos` (server component; `requireRol(ADMIN)`).
- [x] Ruta **alta** `/(admin)/panel/recursos/nuevo` con `RecursoForm` (RHF).
- [x] Ruta **edición** `/(admin)/panel/recursos/[id]/editar`.
- [x] `RecursosTabla` (estado activo/archivado + filtro por categoría) en `recursos/ui`.
- [x] Acción de **archivar/activar** (botones con `<form>` + server action en la tabla).
- [x] Server actions (crear/editar/archivar): validan con `zod`, revalidan rol (`requireRol(ADMIN)`),
      invocan los casos de uso compuestos y hacen `revalidatePath` del listado.
- [x] Confirmar que `proxy.ts` protege `/panel/recursos` (ya cubre `/panel/:path*`).

## 6. Composición (wiring)

- [x] Exponer la composición (repo Prisma + casos de uso) sin romper los límites de capas (patrón de
      `@/shared/auth`); `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- [x] `crearRecurso`: crea, rechaza duplicado (insensible a mayúsculas), normaliza, rechaza categoría
      inválida / campos vacíos.
- [x] `editarRecurso`: actualiza; revalida unicidad al renombrar.
- [x] `archivarRecurso` / `activarRecurso`: alterna `activo`.
- [x] `listarRecursos`: filtra por categoría y solo-activos.
- [x] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [x] `docker compose up -d` y base `healthy`.
- [x] `pnpm db:migrate` aplicada.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, crear/editar/archivar un recurso y verlo en el listado; un no-`ADMIN`
      no accede a `/panel/recursos`. _(Pendiente de comprobación manual en navegador.)_

## 9. Cierre

- [x] Revisar que `recursos/domain` y `recursos/application` siguen puras (sin framework/Prisma).
- [x] Verificar que `DOC/features/004-catalogo-de-recursos.md` refleja lo entregado.
- [x] Mover `004 · Catálogo de recursos` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `005 · Ayudas / Envío` a **Siguiente 🔜**.
