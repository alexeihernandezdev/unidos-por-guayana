# 007 · Solicitudes de ayuda — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar los módulos `usuarios` (002), `recursos` (004) y `ayudas` (005).
- [x] Levantar la base: `docker compose up -d`. Requiere el catálogo (004).

## 1. Modelo de datos y migración

- [x] Añadir a `schema.prisma`: enums `UrgenciaSolicitud`, `EstadoSolicitud`, `CerradaPor`; modelos
      `Solicitud` (índices por `estado` y `sector`) y `RecursoSolicitud`
      (`@@unique([solicitudId, recursoId])`, `cantidadEstimada Decimal?`).
- [x] Añadir relación inversa `solicitudes` en `Usuario` y `recursoSolicitudes` en `Recurso`.
- [x] `pnpm db:migrate` — migración `add_solicitudes` aplicada sin errores.

## 2. Dominio (`src/modules/solicitudes/domain`)

- [x] Enums `UrgenciaSolicitud`, `EstadoSolicitud`, `CerradaPor` (const-object + unión).
- [x] Entidades `Solicitud` (con `recursos`) y `RecursoSolicitud`; tipos `NuevaSolicitud`,
      `NuevoRecursoSolicitud`, `CambiosSolicitud`.
- [x] Máquina de estados: `puedeMarcarAtendida`, `puedeCerrar`, `esEditable`.
- [x] Validaciones puras (`sector`/`descripcion` no vacíos, urgencia válida,
      `cantidadEstimada > 0` si viene, sin recurso repetido).
- [x] Contrato `SolicitudRepository` (`crear`, `buscarPorId`, `listarDeSolicitante`, `listar` con
      filtros, `actualizarCabecera`, recursos, `cambiarEstado`).

## 3. Aplicación (`src/modules/solicitudes/application`)

- [x] `crearSolicitud` (valida recursos activos del catálogo; rechaza repetidos/cantidad inválida).
- [x] `listarMisSolicitudes` y `listarSolicitudes` (filtros por sector/urgencia/estado).
- [x] `obtenerSolicitud`.
- [x] `editarSolicitud` (dueño + `ABIERTA`).
- [x] `cancelarSolicitud` (dueño; `cerradaPor = SOLICITANTE`).
- [x] `marcarAtendida` y `cerrarSolicitud` (solo `ADMIN`; `cerradaPor = ADMIN` en cierre).
- [x] Errores de aplicación (`SolicitudNoEncontradaError`, `SolicitudNoEditableError`,
      `TransicionInvalidaError`, `NoAutorizadoError`, `RecursoInvalidoError`).
- [x] Mantener la capa pura (solo depende de `domain` + contrato de `RecursoRepository`).

## 4. Infraestructura

- [x] `PrismaSolicitudRepository` sobre `@/lib/prisma` (crea/lee con `include: { recursos }`, mapea
      `Decimal → number`).

## 5. Presentación

### Solicitante
- [x] `/(app)/solicitudes` — mis solicitudes (`requireRol(SOLICITANTE)`).
- [x] `/(app)/solicitudes/nueva` — `SolicitudForm` (RHF, lista dinámica de recursos, selector
      limitado a recursos activos).
- [x] `/(app)/solicitudes/[id]` — detalle + acciones **editar** y **cancelar** si `ABIERTA`.
- [x] Server actions `crear/editar/cancelar`: `requireRol(SOLICITANTE)`, zod, `revalidatePath`.

### Admin
- [x] `/(admin)/panel/solicitudes` — listado con filtros por `sector`, `urgencia`, `estado`.
- [x] `/(admin)/panel/solicitudes/[id]` — detalle + acciones **marcar atendida** / **cerrar**.
- [x] Server actions con `requireRol(ADMIN)` y `revalidatePath`.
- [x] Confirmar que `proxy.ts` cubre `/(app)/solicitudes/*` y `/(admin)/panel/solicitudes/*`.

### Componentes
- [x] `SolicitudForm`, `SolicitudesTabla`, `EstadoSolicitudBadge`, `UrgenciaBadge`,
      `SolicitudAcciones` en `solicitudes/ui`.

## 6. Composición (wiring)

- [x] Exponer la composición (repo Prisma + `RecursoRepository` + casos de uso) sin romper los
      límites de capas (patrón de `@/shared/auth`).

## 7. Tests (Vitest)

- [x] Máquina de estados: transiciones válidas e inválidas; `esEditable`.
- [x] `crearSolicitud`: crea; rechaza recurso archivado/inexistente, repetido,
      `cantidadEstimada ≤ 0`, campos vacíos, urgencia inválida.
- [x] `editarSolicitud`: dueño; bloqueada fuera de `ABIERTA`.
- [x] `cancelarSolicitud`: dueño; `cerradaPor = SOLICITANTE`.
- [x] `marcarAtendida` / `cerrarSolicitud`: transiciones válidas y errores.
- [x] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [x] `docker compose up -d` y base `healthy`.
- [x] `pnpm db:migrate` aplicada.
- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: como `SOLICITANTE` crear/editar/cancelar; como `ADMIN` filtrar y cambiar estado;
      como `COLABORADOR` verificar que no accede a la creación.

## 9. Cierre

- [x] Revisar que `solicitudes/domain` y `solicitudes/application` siguen puras (sin
      framework/Prisma).
- [x] Generar/actualizar `DOC/features/007-solicitudes-de-ayuda.md` para reflejar lo entregado.
- [x] Mover `007 · Solicitudes de ayuda` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `008 · Panel de administración` a **Siguiente 🔜**.
