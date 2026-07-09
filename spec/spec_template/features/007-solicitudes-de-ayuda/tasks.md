# 007 · Solicitudes de ayuda — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar los módulos `usuarios` (002), `recursos` (004) y `ayudas` (005).
- [ ] Levantar la base: `docker compose up -d`. Requiere el catálogo (004).

## 1. Modelo de datos y migración

- [ ] Añadir a `schema.prisma`: enums `UrgenciaSolicitud`, `EstadoSolicitud`, `CerradaPor`; modelos
      `Solicitud` (índices por `estado` y `sector`) y `RecursoSolicitud`
      (`@@unique([solicitudId, recursoId])`, `cantidadEstimada Decimal?`).
- [ ] Añadir relación inversa `solicitudes` en `Usuario` y `recursoSolicitudes` en `Recurso`.
- [ ] `pnpm db:migrate` — migración `add_solicitudes` aplicada sin errores.

## 2. Dominio (`src/modules/solicitudes/domain`)

- [ ] Enums `UrgenciaSolicitud`, `EstadoSolicitud`, `CerradaPor` (const-object + unión).
- [ ] Entidades `Solicitud` (con `recursos`) y `RecursoSolicitud`; tipos `NuevaSolicitud`,
      `NuevoRecursoSolicitud`, `CambiosSolicitud`.
- [ ] Máquina de estados: `puedeMarcarAtendida`, `puedeCerrar`, `esEditable`.
- [ ] Validaciones puras (`sector`/`descripcion` no vacíos, urgencia válida,
      `cantidadEstimada > 0` si viene, sin recurso repetido).
- [ ] Contrato `SolicitudRepository` (`crear`, `buscarPorId`, `listarDeSolicitante`, `listar` con
      filtros, `actualizarCabecera`, recursos, `cambiarEstado`).

## 3. Aplicación (`src/modules/solicitudes/application`)

- [ ] `crearSolicitud` (valida recursos activos del catálogo; rechaza repetidos/cantidad inválida).
- [ ] `listarMisSolicitudes` y `listarSolicitudes` (filtros por sector/urgencia/estado).
- [ ] `obtenerSolicitud`.
- [ ] `editarSolicitud` (dueño + `ABIERTA`).
- [ ] `cancelarSolicitud` (dueño; `cerradaPor = SOLICITANTE`).
- [ ] `marcarAtendida` y `cerrarSolicitud` (solo `ADMIN`; `cerradaPor = ADMIN` en cierre).
- [ ] Errores de aplicación (`SolicitudNoEncontradaError`, `SolicitudNoEditableError`,
      `TransicionInvalidaError`, `NoAutorizadoError`, `RecursoInvalidoError`).
- [ ] Mantener la capa pura (solo depende de `domain` + contrato de `RecursoRepository`).

## 4. Infraestructura

- [ ] `PrismaSolicitudRepository` sobre `@/lib/prisma` (crea/lee con `include: { recursos }`, mapea
      `Decimal → number`).

## 5. Presentación

### Solicitante
- [ ] `/(app)/solicitudes` — mis solicitudes (`requireRol(SOLICITANTE)`).
- [ ] `/(app)/solicitudes/nueva` — `SolicitudForm` (RHF, lista dinámica de recursos, selector
      limitado a recursos activos).
- [ ] `/(app)/solicitudes/[id]` — detalle + acciones **editar** y **cancelar** si `ABIERTA`.
- [ ] Server actions `crear/editar/cancelar`: `requireRol(SOLICITANTE)`, zod, `revalidatePath`.

### Admin
- [ ] `/(admin)/panel/solicitudes` — listado con filtros por `sector`, `urgencia`, `estado`.
- [ ] `/(admin)/panel/solicitudes/[id]` — detalle + acciones **marcar atendida** / **cerrar**.
- [ ] Server actions con `requireRol(ADMIN)` y `revalidatePath`.
- [ ] Confirmar que `proxy.ts` cubre `/(app)/solicitudes/*` y `/(admin)/panel/solicitudes/*`.

### Componentes
- [ ] `SolicitudForm`, `SolicitudesTabla`, `EstadoSolicitudBadge`, `UrgenciaBadge`,
      `RecursosSolicitudEditor`, `SolicitudAcciones` en `solicitudes/ui`.

## 6. Composición (wiring)

- [ ] Exponer la composición (repo Prisma + `RecursoRepository` + casos de uso) sin romper los
      límites de capas (patrón de `@/shared/auth`).

## 7. Tests (Vitest)

- [ ] Máquina de estados: transiciones válidas e inválidas; `esEditable`.
- [ ] `crearSolicitud`: crea; rechaza recurso archivado/inexistente, repetido,
      `cantidadEstimada ≤ 0`, campos vacíos, urgencia inválida.
- [ ] `editarSolicitud`: dueño; bloqueada fuera de `ABIERTA`.
- [ ] `cancelarSolicitud`: dueño; `cerradaPor = SOLICITANTE`.
- [ ] `marcarAtendida` / `cerrarSolicitud`: transiciones válidas y errores.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `SOLICITANTE` crear/editar/cancelar; como `ADMIN` filtrar y cambiar estado;
      como `COLABORADOR` verificar que no accede a la creación.

## 9. Cierre

- [ ] Revisar que `solicitudes/domain` y `solicitudes/application` siguen puras (sin
      framework/Prisma).
- [ ] Generar/actualizar `DOC/features/007-solicitudes-de-ayuda.md` para reflejar lo entregado.
- [ ] Mover `007 · Solicitudes de ayuda` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `008 · Panel de administración` a **Siguiente 🔜**.
