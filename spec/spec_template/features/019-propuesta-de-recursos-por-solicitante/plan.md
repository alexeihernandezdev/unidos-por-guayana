# 019 · Propuesta de recursos por el solicitante — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros). **Enmienda** el módulo `src/modules/recursos/`
> (feature 004) y conecta con el flujo de solicitudes (feature 007).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), ampliando el
módulo `recursos` ya existente en vez de crear uno nuevo. Orden:
**enmienda del modelo `Recurso` + migración con backfill → dominio/aplicación (+tests) → repositorio
Prisma → UI (propuesta del solicitante + bandeja del admin) → ajuste de selectores de 005/006**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002
> (`requireRol`, `proxy.ts`).

## 1. Modelo de datos y migración (backfill)

- En `prisma/schema.prisma`:
  - `enum EstadoAprobacionRecurso { APROBADO PROPUESTO RECHAZADO }`.
  - En `model Recurso`: `estadoAprobacion EstadoAprobacionRecurso @default(APROBADO)`,
    `propuestoPorId String?`, relación `propuestoPor Usuario? @relation("RecursosPropuestos", fields: [propuestoPorId], references: [id])`.
  - En `model Usuario`: relación inversa `recursosPropuestos Recurso[] @relation("RecursosPropuestos")`.
- `pnpm db:migrate` → migración `add_estado_aprobacion_recurso`.
- **Backfill:** asegurar que las filas existentes quedan `estadoAprobacion = APROBADO`. Crear la
  columna como `NOT NULL DEFAULT 'APROBADO'` rellena las filas previas; si se hace en dos pasos,
  añadir un `UPDATE recursos SET "estadoAprobacion" = 'APROBADO' WHERE "estadoAprobacion" IS NULL` en
  la migración. `propuestoPorId` queda `NULL` para todo lo previo.
- Regenerar el cliente (`pnpm db:generate`, que hace `migrate`).

## 2. Capa de dominio (`src/modules/recursos/domain`) — pura

- Enum `EstadoAprobacionRecurso` (const-object + unión de strings, mismos valores que Prisma), como
  `CategoriaRecurso`.
- Ampliar la entidad `Recurso` con `estadoAprobacion: EstadoAprobacionRecurso` y
  `propuestoPorId: string | null`.
- Ampliar `NuevoRecurso` para que el caso de uso fije el estado inicial y `propuestoPorId` según el
  origen (admin vs solicitante).
- `reglas.ts`:
  - `esSeleccionable(recurso)` = `estadoAprobacion === APROBADO && activo`.
  - Máquina de revisión pura: transiciones válidas `PROPUESTO → APROBADO` | `PROPUESTO → RECHAZADO`;
    helper `puedeRevisar(estado)` / validación de transición.
- Ampliar `FiltroRecursos` (en `RecursoRepository.ts`) con `estadoAprobacion?` y
  `soloSeleccionables?` (equivalente a `APROBADO` + `activo`).
- Sin imports de framework ni Prisma (ESLint lo impide).

## 3. Capa de aplicación (`src/modules/recursos/application`) — pura

- **Nuevos casos de uso:**
  - `proponerRecurso(deps, input, solicitanteId)`: normaliza el nombre, valida (unicidad insensible a
    mayúsculas, unidad no vacía, categoría válida), crea con `estadoAprobacion = PROPUESTO` y
    `propuestoPorId = solicitanteId`.
  - `aprobarPropuesta(deps, id)`: carga el recurso, valida que esté `PROPUESTO`, transiciona a
    `APROBADO`.
  - `rechazarPropuesta(deps, id)`: análogo, transiciona a `RECHAZADO`.
  - `listarPropuestas(deps)`: `listar({ estadoAprobacion: PROPUESTO })` para la bandeja del admin.
- **Ajustes a casos de uso de 004:**
  - `crearRecurso`: fija `estadoAprobacion = APROBADO`, `propuestoPorId = null` (flujo admin sin
    cambios visibles).
  - `listarRecursos`: soportar `soloSeleccionables` (lo consumen 005/006).
- Errores: `PropuestaNoEncontradaError`, `TransicionAprobacionInvalidaError` (en `errors.ts`).
- Depende solo de `domain`. Tests unitarios con el repo en memoria (`fakes.ts`).

## 4. Infraestructura (`src/modules/recursos/infrastructure`)

- Ampliar `PrismaRecursoRepository`:
  - Mapear `estadoAprobacion` y `propuestoPorId` en la conversión fila → entidad (enum idéntico, sin
    casts).
  - `listar` respeta el filtro `estadoAprobacion` y `soloSeleccionables`
    (`estadoAprobacion = APROBADO AND activo = true`).
  - `crear` y `actualizar` persisten los campos nuevos.

## 5. Presentación (`src/modules/recursos/ui` + `src/modules/solicitudes/ui` + `src/app`)

- **Solicitante (flujo 007):**
  - En `SolicitudForm` (feature 007), cuando el recurso buscado no existe, ofrecer **"Proponer nuevo
    recurso"** que abre un mini-formulario de propuesta (`nombre`, `unidad`, `categoria`,
    `descripcion` opcional), reutilizando piezas de `RecursoForm` (004).
  - **Server action** `proponerRecursoAction`: valida con `zod`, `requireRol(SOLICITANTE)`, invoca
    `proponerRecurso` (repo Prisma inyectado), `revalidatePath` del flujo de solicitud.
- **Admin (bajo `/(admin)/panel/recursos`):**
  - **Bandeja de propuestas** como sub-vista o pestaña del listado del catálogo (server component;
    `requireRol(ADMIN)`): tabla `PropuestasTabla` con `propuestoPor` y fecha (`DD/MM/AAAA` vía Luxon
    `es-VE`), acciones **aprobar** / **rechazar** (botones con `<form>` + server action) y enlace a
    **editar** antes de aprobar (reusa la edición de 004).
  - Server actions `aprobarPropuestaAction` / `rechazarPropuestaAction`: `zod`, `requireRol(ADMIN)`,
    caso de uso, `revalidatePath`.
  - Ampliar `RecursosTabla` (004) para mostrar la etiqueta de `estadoAprobacion` junto al estado
    `activo/archivado`.
- **Selectores de 005/006:** asegurar que consumen `listarRecursos({ soloSeleccionables: true })`, de
  modo que `PROPUESTO`/`RECHAZADO`/archivados no aparezcan.
- Ampliar el `matcher` de `proxy.ts` (002) si hace falta para la ruta de propuesta del solicitante y
  la bandeja del admin.

## 6. Composición (wiring)

- Igual que en 004: exponer la composición (repo Prisma + casos de uso, incluidos los nuevos) desde la
  fachada del módulo `recursos` que la presentación importa sin romper los límites de capas (ESLint).
  `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- `proponerRecurso`: crea en `PROPUESTO` con `propuestoPorId`; **rechaza nombre duplicado**; normaliza
  (trim); rechaza unidad vacía / categoría inválida.
- `crearRecurso` (regresión): nace `APROBADO` con `propuestoPorId = null`.
- `aprobarPropuesta` / `rechazarPropuesta`: transición válida desde `PROPUESTO`; **error** si el
  recurso no está `PROPUESTO`.
- `esSeleccionable`: `APROBADO + activo` → true; `PROPUESTO`, `RECHAZADO` o archivado → false.
- `listarRecursos({ soloSeleccionables })`: excluye `PROPUESTO`/`RECHAZADO`/archivados.
- Con dobles en memoria (`fakes.ts`), colocados junto a cada caso de uso (`*.test.ts`).

## Decisiones

- **`estadoAprobacion` separado de `activo`:** ejes distintos (revisión vs archivado); un recurso es
  seleccionable solo si es `APROBADO` **y** `activo`.
- **Estado inicial por rol, no por cliente:** el caso de uso fija `APROBADO` (admin) o `PROPUESTO`
  (solicitante); el cliente no puede forzarlo.
- **`propuestoPor` nullable:** admin y backfill quedan sin `propuestoPor`.
- **Backfill a `APROBADO`:** los recursos previos siguen usables en metas/aportes sin intervención.
- **Enmienda del módulo `recursos`, no uno nuevo:** la propuesta es una variante del alta de recurso.

## Validación final

1. `docker compose up -d` (base arriba) y `pnpm db:migrate` (migración con backfill aplicada;
   verificar que los recursos previos quedaron `APROBADO`).
2. `pnpm test` (casos de uso en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `SOLICITANTE`, proponer un recurso desde el flujo de solicitud y comprobar que no
   aparece en los selectores de metas/aportes; como `ADMIN`, verlo en la bandeja, aprobarlo y
   comprobar que ya es seleccionable; rechazar otro y comprobar que no aparece.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `019 · Propuesta de recursos por el solicitante` a
  **Hecho ✅**.
- Revisar que la `spec` y el `DOC` de `004 · Catálogo de recursos` mencionan el `estadoAprobacion`
  (enmienda) y que `DOC/features/019-propuesta-de-recursos-por-solicitante.md` refleja lo entregado.
