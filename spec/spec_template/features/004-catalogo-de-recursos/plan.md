# 004 · Catálogo de recursos — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), replicando el
patrón ya probado en el módulo `usuarios` (feature 002). Orden:
**modelo `Recurso` + migración → dominio/aplicación (+tests) → repositorio Prisma → UI de gestión
solo-`ADMIN` → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma` añadir:
  - `enum CategoriaRecurso { SUMINISTRO TRANSPORTE PERSONAL MONETARIO }`
  - `model Recurso { id, nombre @unique, unidad, categoria CategoriaRecurso, descripcion String?, activo Boolean @default(true), createdAt, updatedAt, @@map("recursos") }`
- `pnpm db:migrate` (con la base de Docker arriba) → migración `add_recursos`.
- Regenerar el cliente (`pnpm db:generate` lo hace `migrate`).

## 2. Capa de dominio (`src/modules/recursos/domain`) — pura

- Enum `CategoriaRecurso` (const-object + unión de strings, como `Rol` en `usuarios`; mismos valores
  que Prisma para mapear sin casts).
- Tipo/entidad `Recurso` y tipo `NuevoRecurso` / `CambiosRecurso`.
- Contrato `RecursoRepository`: `crear`, `listar(filtro?)`, `buscarPorId`, `buscarPorNombre`,
  `actualizar`, `cambiarActivo` (o `actualizar` genérico que cubra `activo`).
- Reglas de dominio puras: `normalizarNombre` (trim), validación de que `nombre`/`unidad` no estén
  vacíos y `categoria` sea válida. Sin imports de framework ni Prisma (ESLint lo impide).

## 3. Capa de aplicación (`src/modules/recursos/application`) — pura

- `crearRecurso(deps, input)`: normaliza el nombre, valida campos, comprueba unicidad
  (`buscarPorNombre` insensible a mayúsculas) → rechaza duplicado; crea.
- `listarRecursos(deps, filtro?)`: por categoría y/o solo activos (para el listado y para 005/006).
- `editarRecurso(deps, id, cambios)`: valida y actualiza; si cambia el nombre, revalida unicidad
  (permitiendo el propio recurso).
- `archivarRecurso` / `activarRecurso(deps, id)`: alterna `activo`.
- Errores de aplicación (`NombreDuplicadoError`, `RecursoNoEncontradoError`, …) como en `usuarios`.
- Depende solo de `domain`. Es el sitio de los tests unitarios (con repo en memoria).

## 4. Infraestructura (`src/modules/recursos/infrastructure`)

- `PrismaRecursoRepository` implementa `RecursoRepository` sobre `@/lib/prisma`. Mapea la fila de
  Prisma a la entidad de dominio (enum idéntico, sin casts). La búsqueda por nombre insensible a
  mayúsculas usa `mode: "insensitive"` de Prisma.

## 5. Presentación (`src/modules/recursos/ui` + `src/app`) — solo `ADMIN`

- Rutas bajo el área de administración (protegidas): p. ej.
  - `/(admin)/panel/recursos` — **listado** del catálogo (server component; `requireRol(ADMIN)`).
  - `/(admin)/panel/recursos/nuevo` — **alta**.
  - `/(admin)/panel/recursos/[id]/editar` — **edición**.
- Componentes en `src/modules/recursos/ui` (PascalCase): `RecursoForm` (client, RHF), `RecursosTabla`
  (listado con estado activo/archivado y filtro por categoría), `RecursoAccionesArchivar`.
- **Server actions** para crear/editar/archivar que:
  - validan con `zod` en el límite,
  - vuelven a comprobar el rol (`requireRol(ADMIN)`) — defensa en profundidad,
  - invocan los casos de uso compuestos (repo Prisma inyectado) y hacen `revalidatePath` del listado.
- Ampliar el `matcher` de `proxy.ts` (feature 002) si hace falta para cubrir `/panel/recursos`
  (ya cubre `/panel/:path*`).

## 6. Composición (wiring)

- Igual que en `usuarios`: la composición (repo + casos de uso) se expone desde una fachada que la
  presentación puede importar sin romper los límites de capas (ESLint). Reutilizar el patrón de
  `@/shared/auth` o crear `@/modules/recursos` factory expuesto vía `src/lib`/`src/shared` según el
  patrón vigente. Mantener `app`/`ui` sin importar `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- `crearRecurso`: crea; **rechaza nombre duplicado** (insensible a mayúsculas); normaliza (trim);
  rechaza categoría inválida y campos vacíos.
- `editarRecurso`: actualiza; al renombrar, revalida unicidad sin chocar consigo mismo.
- `archivarRecurso`/`activarRecurso`: alterna `activo`.
- `listarRecursos`: filtra por categoría y por solo-activos.
- Con dobles en memoria (sin base real), colocados junto a cada caso de uso (`*.test.ts`).

## Decisiones

- **Archivar (soft) en vez de borrar:** protege la integridad referencial futura (metas/aportes).
- **Nombre único normalizado:** unicidad insensible a mayúsculas en la aplicación + `@unique` en la
  base; se guarda el texto tal cual (con `trim`).
- **`unidad` texto libre:** flexibilidad; la coherencia de sumas la garantiza usar el mismo `Recurso`.
- **Dominio/aplicación agnósticos de Prisma:** el repo Prisma es un adaptador; la lógica es pura y
  testeable, como en `usuarios`.

## Validación final

1. `docker compose up -d` (base arriba) y `pnpm db:migrate` (migración aplicada).
2. `pnpm test` (casos de uso en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN`, crear/editar/archivar un recurso y verlo en el listado; comprobar que un
   no-`ADMIN` no accede a `/panel/recursos`.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `004 · Catálogo de recursos` a **Hecho ✅** y promover
  `005 · Ayudas / Envío` a **Siguiente 🔜**.
- Verificar que `DOC/features/004-catalogo-de-recursos.md` refleja lo entregado.
