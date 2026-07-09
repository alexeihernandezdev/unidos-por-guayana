# 006 · Aportes — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros).

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), reutilizando el
patrón de `usuarios` (002), `recursos` (004) y `ayudas` (005). Orden:
**modelo `Aporte` + migración → dominio (entidad + máquina de estados + `progresoDeMeta`) →
aplicación (+tests) → repositorio Prisma → UI colaborador + UI admin → hueco de progreso en el
detalle de Ayuda (005) → validación**.

> ⚠️ Antes de tocar route handlers, server actions o server components de Next 16, leer la guía en
> `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza la feature 002.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`:
  - `enum EstadoAporte { COMPROMETIDO RECIBIDO }`.
  - `model Aporte { id, ayudaId, ayuda @relation(fields: [ayudaId], references: [id]),
    recursoId, recurso @relation(fields: [recursoId], references: [id]),
    colaboradorId, colaborador @relation(fields: [colaboradorId], references: [id]),
    cantidad Decimal @db.Decimal(12,2), estado EstadoAporte @default(COMPROMETIDO),
    nota String?, recibidoEn DateTime?, createdAt, updatedAt,
    @@index([ayudaId]), @@index([ayudaId, recursoId, estado]), @@map("aportes") }`.
  - Relaciones inversas `aportes` en `Ayuda`, `Recurso` y `Usuario`.
- `pnpm db:migrate` (base de Docker arriba) → migración `add_aportes`.

## 2. Capa de dominio (`src/modules/aportes/domain`) — pura

- `EstadoAporte` (const-object + unión, mismos valores que Prisma).
- Entidad `Aporte` y tipos `NuevoAporte`, `CambiosAporte`.
- **Máquina de estados** pura:
  - `puedeMarcarRecibido(estado)` (solo desde `COMPROMETIDO`).
  - `puedeCancelar(estado)` (solo `COMPROMETIDO`).
  - `puedeRevertir(estado)` (solo desde `RECIBIDO`, uso admin).
- Validaciones puras: `cantidad > 0`; longitud razonable de `nota`.
- Agregación pura: `progresoDeMeta(aportes, cantidadObjetivo) → { recibido, prometido, porcentaje }`.
  Testeable sin base.
- Contrato `AporteRepository`: `crear`, `buscarPorId`, `listarPorAyuda(filtro?)`,
  `listarDeColaborador(colaboradorId)`, `cambiarEstado(id, nuevoEstado)`, `eliminar` (para
  cancelación), y `progresoPorAyuda(ayudaId)` → agregación por meta.

## 3. Capa de aplicación (`src/modules/aportes/application`) — pura

- `crearAporte(deps, input)`:
  - Depende de `AyudaRepository` (005) y `RecursoRepository` (004).
  - Valida Ayuda existe y está en `RECOLECTANDO` (si no → `AyudaNoAceptaAportesError`).
  - Valida recurso activo y presente en `metas` de la Ayuda (si no → `RecursoFueraDeMetasError`).
  - Valida `cantidad > 0`.
  - Crea en `COMPROMETIDO` y devuelve el aporte.
- `cancelarAporte(deps, id, actor)`: comprueba que `actor` es dueño o `ADMIN`; solo si
  `COMPROMETIDO` y la Ayuda sigue en `RECOLECTANDO`.
- `marcarRecibido(deps, id)`: valida transición; setea `recibidoEn = now()`; persiste.
- `revertirRecibido(deps, id)`: valida transición inversa; limpia `recibidoEn`.
- `listarAportesPorAyuda(deps, ayudaId, filtro?)` y `listarAportesDeColaborador(deps, colaboradorId)`.
- `progresoDeAyuda(deps, ayudaId)`:
  - Lee metas (005) + agregación de aportes.
  - Por cada meta devuelve `{ recursoId, nombre, unidad, objetivo, recibido, prometido, porcentaje }`.
- Errores de aplicación: `AporteNoEncontradoError`, `AyudaNoAceptaAportesError`,
  `RecursoFueraDeMetasError`, `TransicionInvalidaError`, `NoAutorizadoError`.
- Depende solo de `domain` (+ contratos de `AyudaRepository`/`RecursoRepository`). Tests aquí.

## 4. Infraestructura (`src/modules/aportes/infrastructure`)

- `PrismaAporteRepository` sobre `@/lib/prisma`:
  - `crear` con `create` normal.
  - `cambiarEstado` idempotente: `updateMany` con `where: { id, estado: previo }` para evitar
    race conditions al marcar recibido.
  - `progresoPorAyuda`: `groupBy` sobre `aportes` filtrado por `ayudaId` y `estado`, sumando
    `cantidad`. Cruce con las `metas` de la Ayuda (leídas del `AyudaRepository`).
  - Mapear `Decimal → number` al salir del repo.

## 5. Presentación (`src/modules/aportes/ui` + `src/app`)

### 5.1 Vista colaborador (autenticado, rol `COLABORADOR` o `ADMIN`)

- Botón **"Aportar"** en el detalle de una Ayuda pública (donde exista) o en la vista autenticada:
  - Ruta `/ayudas/[id]/aportar` (o modal desde el detalle). Server component que carga la Ayuda y sus
    metas; formulario en cliente.
  - `AporteForm` (RHF + zod): selector de recurso limitado a las metas, `cantidad` (con la unidad
    del recurso mostrada), `nota` opcional.
  - Server action `crearAporteAction`: `requireRol(COLABORADOR | ADMIN)`, valida con zod, invoca
    `crearAporte`, `revalidatePath`.
- Vista **"Mis aportes"** (`/mis-aportes` o similar): tabla con Ayuda, recurso, cantidad, estado.
  Acción de **cancelar** para los `COMPROMETIDO`.

### 5.2 Vista admin

- En el detalle de Ayuda (`/(admin)/panel/ayudas/[id]` de 005), añadir:
  - **Tarjeta de progreso** por meta (`ProgresoMetas` component) con datos de `progresoDeAyuda`.
  - **Tabla de aportes** de esa Ayuda (`AportesTabla`) con filtro por estado y columnas: colaborador,
    recurso, cantidad, nota, estado, fecha.
  - Acciones por fila: **marcar recibido**, **revertir**, **cancelar** (según estado).
- Server actions con `requireRol(ADMIN)`, `revalidatePath` del detalle.

### 5.3 Componentes

- `AporteForm`, `AportesTabla`, `ProgresoMetas`, `EstadoAporteBadge`, `AporteAcciones`.

## 6. Composición (wiring)

- Exponer la composición (repos + casos de uso) siguiendo el patrón de `@/shared/auth`. `app`/`ui` no
  importan `infrastructure`/`lib` directamente. Los casos de uso reciben `AyudaRepository` y
  `RecursoRepository` de las features 004/005; no duplicar contratos.

## 7. Tests (Vitest)

- Máquina de estados: `puedeMarcarRecibido`, `puedeCancelar`, `puedeRevertir` (positivas y negativas).
- `crearAporte`: crea; rechaza cantidad ≤ 0, recurso archivado, recurso fuera de metas, Ayuda no en
  `RECOLECTANDO`.
- `cancelarAporte`: solo dueño o `ADMIN`; solo si `COMPROMETIDO`.
- `marcarRecibido` / `revertirRecibido`: transiciones válidas e inválidas.
- `progresoDeMeta` (función pura): distintos escenarios (cero aportes, todos `COMPROMETIDO`,
  mezcla, meta cumplida al 100% y superada).
- Con dobles en memoria (repo de aportes, ayudas y recursos), colocados junto a cada caso de uso.

## Decisiones

- **Solo `RECIBIDO` cuenta al progreso:** evita inflar cifras con intenciones.
- **`updateMany` idempotente para transiciones:** protege de doble marcado por race conditions.
- **Índice `(ayudaId, recursoId, estado)`:** hace barato el `groupBy` del progreso.
- **`Decimal` en base, `number` en dominio:** consistente con 005.
- **Sin denormalización de contadores:** el `groupBy` con índice es suficiente para el volumen
  esperado; evitar cache prematuro.

## Validación final

1. `docker compose up -d` y `pnpm db:migrate` (migración `add_aportes` aplicada).
2. `pnpm test` (casos de uso y `progresoDeMeta` en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `COLABORADOR`, aportar a una Ayuda en `RECOLECTANDO`; como `ADMIN`, ver el
   aporte en `COMPROMETIDO`, marcarlo `RECIBIDO`, y comprobar que el progreso de la meta refleja la
   suma. Cancelar un `COMPROMETIDO`. Intentar aportar a una Ayuda en `LISTO` (rechazado).
   Intentar aportar como `SOLICITANTE` (rechazado).

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `006 · Aportes` a **Hecho ✅** y promover
  `007 · Solicitudes de ayuda` a **Siguiente 🔜**.
- Generar/actualizar `DOC/features/006-aportes.md` para que refleje lo entregado.
