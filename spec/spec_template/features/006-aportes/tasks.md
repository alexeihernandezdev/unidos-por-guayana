# 006 · Aportes — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar los módulos `usuarios` (002), `recursos` (004) y `ayudas` (005).
- [ ] Levantar la base: `docker compose up -d`. Requiere `Recurso` (004) y `Ayuda`/`MetaRecurso` (005).

## 1. Modelo de datos y migración

- [ ] Añadir a `schema.prisma`: enum `EstadoAporte` y modelo `Aporte` (`ayudaId`, `recursoId`,
      `colaboradorId`, `cantidad Decimal(12,2)`, `estado` por defecto `COMPROMETIDO`, `nota?`,
      `recibidoEn?`, timestamps, índices `@@index([ayudaId])` y
      `@@index([ayudaId, recursoId, estado])`, `@@map("aportes")`).
- [ ] Añadir relaciones inversas `aportes` en `Ayuda`, `Recurso` y `Usuario`.
- [ ] `pnpm db:migrate` — migración `add_aportes` aplicada sin errores.

## 2. Dominio (`src/modules/aportes/domain`)

- [ ] Enum `EstadoAporte` (const-object + unión, mismos valores que Prisma).
- [ ] Entidad `Aporte` y tipos `NuevoAporte` / `CambiosAporte`.
- [ ] Máquina de estados: `puedeMarcarRecibido`, `puedeCancelar`, `puedeRevertir`.
- [ ] Validaciones puras (`cantidad > 0`, longitud de `nota`).
- [ ] Función pura `progresoDeMeta(aportes, cantidadObjetivo) → { recibido, prometido, porcentaje }`.
- [ ] Contrato `AporteRepository` (`crear`, `buscarPorId`, `listarPorAyuda`, `listarDeColaborador`,
      `cambiarEstado`, `eliminar`, `progresoPorAyuda`).

## 3. Aplicación (`src/modules/aportes/application`)

- [ ] `crearAporte`: valida Ayuda en `RECOLECTANDO`, recurso activo y presente en metas, cantidad > 0.
- [ ] `cancelarAporte`: dueño o `ADMIN`; solo si `COMPROMETIDO` y Ayuda en `RECOLECTANDO`.
- [ ] `marcarRecibido` (solo `ADMIN`): transición y `recibidoEn = now()`.
- [ ] `revertirRecibido` (solo `ADMIN`): transición inversa; limpia `recibidoEn`.
- [ ] `listarAportesPorAyuda` y `listarAportesDeColaborador`.
- [ ] `progresoDeAyuda(ayudaId)`: combina metas (005) + agregación de aportes por meta.
- [ ] Errores de aplicación (`AporteNoEncontradoError`, `AyudaNoAceptaAportesError`,
      `RecursoFueraDeMetasError`, `TransicionInvalidaError`, `NoAutorizadoError`).
- [ ] Mantener la capa pura (solo depende de `domain` + contratos de repos externos).

## 4. Infraestructura

- [ ] `PrismaAporteRepository` sobre `@/lib/prisma`:
      - `cambiarEstado` idempotente con `updateMany` filtrando por estado previo.
      - `progresoPorAyuda` con `groupBy` por `(ayudaId, recursoId, estado)` sumando `cantidad`.
      - Mapear `Decimal → number`.

## 5. Presentación

### Colaborador
- [ ] Ruta `/ayudas/[id]/aportar` (o modal): server component + `AporteForm` con selector limitado a
      las metas de la Ayuda; `cantidad` y `nota`.
- [ ] Server action `crearAporteAction`: `requireRol(COLABORADOR | ADMIN)`, `zod`, `revalidatePath`.
- [ ] Vista **"Mis aportes"** con listado y acción de **cancelar** (solo `COMPROMETIDO`).

### Admin
- [ ] En el detalle `/(admin)/panel/ayudas/[id]` (feature 005): añadir `ProgresoMetas` y
      `AportesTabla` con filtro por estado.
- [ ] Acciones por fila: **marcar recibido**, **revertir**, **cancelar** (server actions con
      `requireRol(ADMIN)` y `revalidatePath`).
- [ ] Confirmar que `proxy.ts` cubre las nuevas rutas (colaborador y admin).

### Componentes
- [ ] `AporteForm`, `AportesTabla`, `ProgresoMetas`, `EstadoAporteBadge`, `AporteAcciones` en
      `aportes/ui`.

## 6. Composición (wiring)

- [ ] Exponer la composición (repos + casos de uso) sin romper los límites de capas (patrón de
      `@/shared/auth`). Los casos de uso reciben `AyudaRepository` y `RecursoRepository` desde 004/005.

## 7. Tests (Vitest)

- [ ] Máquina de estados: transiciones válidas e inválidas.
- [ ] `crearAporte`: crea; rechaza cantidad ≤ 0, recurso archivado, recurso fuera de metas, Ayuda no
      `RECOLECTANDO`.
- [ ] `cancelarAporte`: dueño vs admin vs otro; estado válido.
- [ ] `marcarRecibido` / `revertirRecibido`: transiciones y errores.
- [ ] `progresoDeMeta`: cero aportes, todos `COMPROMETIDO`, mezcla, cumplida al 100%, superada.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `COLABORADOR` aportar; como `ADMIN` marcar `RECIBIDO` y ver progreso; cancelar
      un `COMPROMETIDO`; intentar aportar a una Ayuda en `LISTO` (rechazado); intentar aportar como
      `SOLICITANTE` (rechazado).

## 9. Cierre

- [ ] Revisar que `aportes/domain` y `aportes/application` siguen puras (sin framework/Prisma).
- [ ] Generar/actualizar `DOC/features/006-aportes.md` para reflejar lo entregado.
- [ ] Mover `006 · Aportes` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `007 · Solicitudes de ayuda` a **Siguiente 🔜**.
