# 007 · Solicitudes de ayuda — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), replicando el
patrón de `recursos` (004) y `ayudas` (005). Orden:
**modelo `Solicitud` + `RecursoSolicitud` + migración → dominio (entidades + máquina de estados) →
aplicación (+tests) → repositorio Prisma → UI solicitante + UI admin → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`:
  - `enum UrgenciaSolicitud { BAJA MEDIA ALTA }`.
  - `enum EstadoSolicitud { ABIERTA ATENDIDA CERRADA }`.
  - `enum CerradaPor { SOLICITANTE ADMIN }`.
  - `model Solicitud { id, sector, urgencia UrgenciaSolicitud, descripcion,
    estado EstadoSolicitud @default(ABIERTA), cerradaPor CerradaPor?,
    solicitanteId, solicitante @relation(fields: [solicitanteId], references: [id]),
    recursos RecursoSolicitud[], createdAt, updatedAt,
    @@index([estado]), @@index([sector]), @@map("solicitudes") }`.
  - `model RecursoSolicitud { id, solicitudId, solicitud @relation(onDelete: Cascade),
    recursoId, recurso @relation, cantidadEstimada Decimal? @db.Decimal(12,2),
    createdAt, updatedAt, @@unique([solicitudId, recursoId]), @@map("recursos_solicitud") }`.
  - Relación inversa `solicitudes` en `Usuario` y `recursoSolicitudes` en `Recurso`.
- `pnpm db:migrate` → migración `add_solicitudes`.

## 2. Capa de dominio (`src/modules/solicitudes/domain`) — pura

- Enums `UrgenciaSolicitud`, `EstadoSolicitud`, `CerradaPor` (const-object + unión, mismos valores
  que Prisma).
- Entidades `Solicitud` (con `recursos: RecursoSolicitud[]`) y `RecursoSolicitud`; tipos
  `NuevaSolicitud`, `NuevoRecursoSolicitud`, `CambiosSolicitud`.
- **Máquina de estados** pura:
  - `puedeMarcarAtendida(estado)` (solo desde `ABIERTA`).
  - `puedeCerrar(estado)` (solo desde `ABIERTA`).
  - `esEditable(estado)` → solo `ABIERTA`.
- Validaciones puras: `sector` normalizado (`trim`) no vacío, `descripcion` no vacía, urgencia
  válida, `cantidadEstimada > 0` si viene, sin recurso repetido.
- Contrato `SolicitudRepository`: `crear` con recursos, `buscarPorId` con recursos,
  `listarDeSolicitante(solicitanteId)`, `listar(filtro?)` (por sector/urgencia/estado),
  `actualizarCabecera`, `reemplazarRecursos`/`upsertRecurso`/`quitarRecurso`,
  `cambiarEstado(id, nuevoEstado, cerradaPor?)`, `eliminar` (opcional; ver spec).

## 3. Capa de aplicación (`src/modules/solicitudes/application`) — pura

- `crearSolicitud(deps, input, solicitanteId)`: valida cabecera + recursos; comprueba (vía
  `RecursoRepository` de 004) que cada recurso exista y esté activo; rechaza repetidos y cantidad
  no positiva; crea en `ABIERTA`.
- `listarMisSolicitudes(deps, solicitanteId)`.
- `listarSolicitudes(deps, filtro?)`.
- `obtenerSolicitud(deps, id)`.
- `editarSolicitud(deps, id, cambios, actorId)`: comprueba `actorId === solicitanteId` **y**
  `esEditable(estado)`; si no, `SolicitudNoEditableError`/`NoAutorizadoError`.
- `cancelarSolicitud(deps, id, solicitanteId)`: dueño + `ABIERTA` → `CERRADA` con
  `cerradaPor = SOLICITANTE`.
- `marcarAtendida(deps, id)` / `cerrarSolicitud(deps, id)` (solo `ADMIN`, con `cerradaPor = ADMIN`
  en el cierre). Ambas validan `ABIERTA`.
- Errores de aplicación: `SolicitudNoEncontradaError`, `SolicitudNoEditableError`,
  `TransicionInvalidaError`, `NoAutorizadoError`, `RecursoInvalidoError`.
- Depende solo de `domain` (+ contrato de `RecursoRepository`). Tests aquí.

## 4. Infraestructura (`src/modules/solicitudes/infrastructure`)

- `PrismaSolicitudRepository` sobre `@/lib/prisma`: crea/lee `Solicitud` con sus `recursos`
  (`include`); mapea `Decimal → number`. Reutiliza `RecursoRepository` de 004 para validar
  recursos activos.

## 5. Presentación (`src/modules/solicitudes/ui` + `src/app`)

### 5.1 Vista solicitante (rol `SOLICITANTE`)

- `/(app)/solicitudes` — **mis solicitudes** (listado con estado y urgencia).
- `/(app)/solicitudes/nueva` — **alta** con `SolicitudForm` (RHF, lista dinámica de recursos,
  selector limitado a recursos activos del catálogo).
- `/(app)/solicitudes/[id]` — **detalle** con acción **cancelar** si `ABIERTA` (y **editar** en la
  misma pantalla o ruta hija `.../editar`).
- Server actions `crear/editar/cancelar`: `requireRol(SOLICITANTE)`, zod, `revalidatePath`.

### 5.2 Vista admin

- `/(admin)/panel/solicitudes` — **listado** con filtros por `sector`, `urgencia`, `estado`.
- `/(admin)/panel/solicitudes/[id]` — **detalle** con acciones **marcar atendida** y **cerrar**.
- Server actions con `requireRol(ADMIN)` y `revalidatePath`.

### 5.3 Componentes

- `SolicitudForm`, `SolicitudesTabla`, `EstadoSolicitudBadge`, `UrgenciaBadge`,
  `RecursosSolicitudEditor`, `SolicitudAcciones`.

## 6. Composición (wiring)

- Exponer la composición (repos + casos de uso) siguiendo el patrón de `@/shared/auth`. Los casos
  de uso reciben `RecursoRepository` (004); no duplicar contratos.

## 7. Tests (Vitest)

- Máquina de estados: `puedeMarcarAtendida`, `puedeCerrar`, `esEditable` (positivas y negativas).
- `crearSolicitud`: crea; rechaza recurso archivado/inexistente, repetido, `cantidadEstimada ≤ 0`,
  campos vacíos, urgencia inválida.
- `editarSolicitud`: dueño; bloqueada fuera de `ABIERTA`.
- `cancelarSolicitud`: dueño; deja `cerradaPor = SOLICITANTE`.
- `marcarAtendida` / `cerrarSolicitud`: transiciones válidas y errores.
- Con dobles en memoria (repos de solicitudes y recursos), colocados junto a cada caso de uso.

## Decisiones

- **Estados terminales sin reapertura:** más simple auditar y comunicar. Se puede crear una nueva
  solicitud si la necesidad persiste.
- **Sin FK obligatoria a `Ayuda`:** relación N-N informal para no acoplar prematuramente 005-007.
- **`cantidadEstimada` opcional:** respeta que el solicitante puede no saber cuánto pedir.
- **`sector` texto libre:** MVP; catalogar cuando aparezca patrón real de uso.
- **Cerrado con autoría (`cerradaPor`)** para distinguir cancelación de cierre administrativo.

## Validación final

1. `docker compose up -d` y `pnpm db:migrate` (migración `add_solicitudes` aplicada).
2. `pnpm test` (casos de uso y máquina de estados en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `SOLICITANTE`, crear/editar/cancelar; como `ADMIN`, listar con filtros, marcar
   atendida y cerrar; como `COLABORADOR`, verificar que **no** accede a la creación.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `007 · Solicitudes de ayuda` a **Hecho ✅** y
  promover `008 · Panel de administración` a **Siguiente 🔜**.
- Generar/actualizar `DOC/features/007-solicitudes-de-ayuda.md` para reflejar lo entregado.
