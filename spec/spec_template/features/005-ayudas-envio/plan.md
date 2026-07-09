# 005 · Ayudas / Envío — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), reutilizando el
patrón de `usuarios` (002) y `recursos` (004). Orden:
**modelo `Ayuda` + `MetaRecurso` + migración → dominio (entidades + máquina de estados) → aplicación
(+tests) → repositorio Prisma → UI de gestión solo-`ADMIN` → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`:
  - `enum EstadoAyuda { RECOLECTANDO LISTO EN_TRANSITO ENTREGADO }`.
  - `model Ayuda { id, titulo, sectorDestino, fecha DateTime, estado EstadoAyuda @default(RECOLECTANDO), descripcion String?, metas MetaRecurso[], createdAt, updatedAt, @@map("ayudas") }`.
  - `model MetaRecurso { id, ayudaId, ayuda @relation(onDelete: Cascade), recursoId, recurso @relation, cantidadObjetivo Decimal @db.Decimal(12,2), createdAt, updatedAt, @@unique([ayudaId, recursoId]), @@map("metas_recurso") }`.
  - En `Recurso` (feature 004) añadir la relación inversa `metas MetaRecurso[]`.
- `pnpm db:migrate` (base de Docker arriba) → migración `add_ayudas_metas`.

## 2. Capa de dominio (`src/modules/ayudas/domain`) — pura

- `EstadoAyuda` (const-object + unión, mismos valores que Prisma).
- Entidades `Ayuda` (con `metas: MetaRecurso[]`) y `MetaRecurso`; tipos `NuevaAyuda`, `NuevaMeta`,
  `CambiosAyuda`.
- **Máquina de estados** como reglas puras:
  - `TRANSICIONES: Record<EstadoAyuda, EstadoAyuda | null>` (siguiente estado o `null` si terminal).
  - `siguienteEstado(estado)` y `puedeAvanzar(desde, hacia)`.
  - `esEditable(estado)` → solo `RECOLECTANDO` permite editar cabecera/metas.
- Validaciones: `cantidadObjetivo > 0`, `sectorDestino`/`titulo` no vacíos, no repetir recurso en las
  metas. Sin imports de framework ni Prisma (ESLint lo impide).
- Contratos: `AyudaRepository` (`crear` con metas, `listar(filtro?)`, `buscarPorId` con metas,
  `actualizarCabecera`, `reemplazarMetas`/`upsertMeta`/`quitarMeta`, `cambiarEstado`, `eliminar`).

## 3. Capa de aplicación (`src/modules/ayudas/application`) — pura

- `crearAyuda(deps, input)`: valida cabecera y metas; comprueba (vía `RecursoRepository` de 004) que
  cada recurso exista y esté **activo**; rechaza recursos repetidos; crea Ayuda + metas en
  `RECOLECTANDO`.
- `listarAyudas(deps, filtro?)`: por estado.
- `obtenerAyuda(deps, id)`: detalle con metas (y datos del recurso para mostrar unidad/nombre).
- `editarCabecera(deps, id, cambios)`: solo si `esEditable(estado)`; si no, `AyudaNoEditableError`.
- `gestionarMetas(deps, id, …)`: añadir / editar objetivo / quitar meta, solo si `esEditable`.
- `avanzarEstado(deps, id)`: calcula `siguienteEstado`; si no hay, `TransicionInvalidaError`; persiste.
- `eliminarAyuda(deps, id)`: solo en `RECOLECTANDO`.
- Errores de aplicación (`AyudaNoEncontradaError`, `TransicionInvalidaError`, `AyudaNoEditableError`,
  `RecursoInvalidoError`). Depende solo de `domain` (+ contrato de `RecursoRepository`). Tests aquí.

## 4. Infraestructura (`src/modules/ayudas/infrastructure`)

- `PrismaAyudaRepository` sobre `@/lib/prisma`: crea/lee Ayuda con sus `metas` (`include`), mapea la
  fila a la entidad de dominio. **Convertir `Decimal` → `number`** en el mapeo (dominio trabaja con
  números puros). Reutilizar el `RecursoRepository` de 004 para validar recursos activos.

## 5. Presentación (`src/modules/ayudas/ui` + `src/app`) — solo `ADMIN`

- Rutas bajo administración (protegidas con `requireRol(ADMIN)`):
  - `/(admin)/panel/ayudas` — **listado** con filtro por estado.
  - `/(admin)/panel/ayudas/nueva` — **alta** (cabecera + metas; selector de recursos activos del 004).
  - `/(admin)/panel/ayudas/[id]` — **detalle** (metas con objetivo/unidad, estado y botón **avanzar**).
  - `/(admin)/panel/ayudas/[id]/editar` — **edición** de cabecera/metas (solo si `RECOLECTANDO`).
- Componentes en `src/modules/ayudas/ui` (PascalCase): `AyudaForm` (RHF, con lista dinámica de metas),
  `AyudasTabla`, `EstadoBadge`, `AvanzarEstadoBoton`, `MetasEditor`.
- **Server actions** (crear/editar/gestionar metas/avanzar/eliminar): validan con `zod`, revalidan rol
  (`requireRol(ADMIN)`), invocan los casos de uso compuestos y `revalidatePath`.
- Formateo de `fecha` con **Luxon**. `proxy.ts` ya cubre `/panel/:path*`.

## 6. Composición (wiring)

- Exponer la composición (repos Prisma de ayudas + recursos, y casos de uso) sin romper los límites de
  capas (patrón de `@/shared/auth`): `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- **Máquina de estados**: transiciones válidas (RECOLECTANDO→LISTO→EN_TRANSITO→ENTREGADO), inválidas
  (saltos, retrocesos, avanzar desde ENTREGADO), y `esEditable`.
- `crearAyuda`: crea con metas; rechaza recurso inexistente/archivado, repetido, o `cantidad <= 0`.
- `editarCabecera`/`gestionarMetas`: bloquean fuera de `RECOLECTANDO`.
- `avanzarEstado`: avanza y rechaza transición inválida.
- Con dobles en memoria (repos de ayudas y recursos), colocados junto a cada caso de uso.

## Decisiones

- **Máquina de estados en dominio puro:** unidireccional y paso a paso; fácil de testear sin base.
- **Metas congeladas tras `LISTO`:** los aportes (006) cuentan contra un objetivo estable.
- **`Decimal` en base, `number` en dominio:** precisión al persistir; simplicidad en la lógica.
- **Recursos activos como fuente de metas:** integridad con el catálogo (004); no metas con recursos
  archivados.
- **Progreso diferido a 006:** el detalle queda preparado para mostrarlo cuando existan aportes.

## Validación final

1. `docker compose up -d` y `pnpm db:migrate` (migración aplicada).
2. `pnpm test` (casos de uso y máquina de estados en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN`, crear un envío con metas, editarlas en `RECOLECTANDO`, avanzar el estado
   por la secuencia válida y comprobar que un salto se rechaza; verificar que un no-`ADMIN` no accede.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `005 · Ayudas / Envío` a **Hecho ✅** y promover
  `006 · Aportes` a **Siguiente 🔜**.
- Verificar que `DOC/features/005-ayudas-envio.md` refleja lo entregado.
