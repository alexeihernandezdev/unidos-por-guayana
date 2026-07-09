# 004 · Catálogo de recursos — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar el patrón del módulo `usuarios` (feature 002).
- [ ] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración

- [ ] Añadir a `schema.prisma`: enum `CategoriaRecurso` y modelo `Recurso` (`nombre` único, `unidad`,
      `categoria`, `descripcion?`, `activo` por defecto `true`, timestamps, `@@map("recursos")`).
- [ ] `pnpm db:migrate` — migración `add_recursos` aplicada sin errores.

## 2. Dominio (`src/modules/recursos/domain`)

- [ ] Enum `CategoriaRecurso` (const-object + unión, mismos valores que Prisma).
- [ ] Entidad `Recurso` y tipos `NuevoRecurso` / `CambiosRecurso`.
- [ ] Contrato `RecursoRepository` (`crear`, `listar`, `buscarPorId`, `buscarPorNombre`, `actualizar`).
- [ ] Reglas puras: `normalizarNombre` (trim) y validaciones (nombre/unidad no vacíos, categoría válida).

## 3. Aplicación (`src/modules/recursos/application`)

- [ ] `crearRecurso` (normaliza, valida, rechaza duplicado, crea).
- [ ] `listarRecursos` (filtro por categoría / solo activos).
- [ ] `editarRecurso` (revalida unicidad al renombrar sin chocar consigo mismo).
- [ ] `archivarRecurso` / `activarRecurso`.
- [ ] Errores de aplicación (`NombreDuplicadoError`, `RecursoNoEncontradoError`).
- [ ] Mantener la capa pura (solo depende de `domain`).

## 4. Infraestructura

- [ ] `PrismaRecursoRepository` sobre `@/lib/prisma` (mapeo sin casts; búsqueda por nombre
      insensible a mayúsculas con `mode: "insensitive"`).

## 5. Presentación (solo `ADMIN`)

- [ ] Ruta **listado** `/(admin)/panel/recursos` (server component; `requireRol(ADMIN)`).
- [ ] Ruta **alta** `/(admin)/panel/recursos/nuevo` con `RecursoForm` (RHF).
- [ ] Ruta **edición** `/(admin)/panel/recursos/[id]/editar`.
- [ ] `RecursosTabla` (estado activo/archivado + filtro por categoría) en `recursos/ui`.
- [ ] Acción de **archivar/activar** (`RecursoAccionesArchivar` o botones en la tabla).
- [ ] Server actions (crear/editar/archivar): validan con `zod`, revalidan rol (`requireRol(ADMIN)`),
      invocan los casos de uso compuestos y hacen `revalidatePath` del listado.
- [ ] Confirmar que `proxy.ts` protege `/panel/recursos` (ya cubre `/panel/:path*`).

## 6. Composición (wiring)

- [ ] Exponer la composición (repo Prisma + casos de uso) sin romper los límites de capas (patrón de
      `@/shared/auth`); `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- [ ] `crearRecurso`: crea, rechaza duplicado (insensible a mayúsculas), normaliza, rechaza categoría
      inválida / campos vacíos.
- [ ] `editarRecurso`: actualiza; revalida unicidad al renombrar.
- [ ] `archivarRecurso` / `activarRecurso`: alterna `activo`.
- [ ] `listarRecursos`: filtra por categoría y solo-activos.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, crear/editar/archivar un recurso y verlo en el listado; un no-`ADMIN`
      no accede a `/panel/recursos`.

## 9. Cierre

- [ ] Revisar que `recursos/domain` y `recursos/application` siguen puras (sin framework/Prisma).
- [ ] Verificar que `DOC/features/004-catalogo-de-recursos.md` refleja lo entregado.
- [ ] Mover `004 · Catálogo de recursos` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `005 · Ayudas / Envío` a **Siguiente 🔜**.
