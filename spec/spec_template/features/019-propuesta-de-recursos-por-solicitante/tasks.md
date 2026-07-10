# 019 · Propuesta de recursos por el solicitante — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. **Enmienda** el módulo `src/modules/recursos/` (004) y conecta
> con el flujo de solicitudes (007).

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, server
      components) y repasar el módulo `recursos` (004) y el `SolicitudForm` de `solicitudes` (007).
- [ ] Levantar la base: `docker compose up -d`.

## 1. Modelo de datos y migración (backfill)

- [ ] Añadir a `schema.prisma`: enum `EstadoAprobacionRecurso { APROBADO PROPUESTO RECHAZADO }`.
- [ ] Ampliar `model Recurso`: `estadoAprobacion @default(APROBADO)`, `propuestoPorId String?` y
      relación `propuestoPor Usuario? @relation("RecursosPropuestos")`.
- [ ] Añadir la relación inversa `recursosPropuestos Recurso[]` en `model Usuario`.
- [ ] `pnpm db:migrate` — migración `add_estado_aprobacion_recurso` aplicada sin errores.
- [ ] **Backfill:** confirmar que los recursos existentes quedan `estadoAprobacion = APROBADO`
      (columna `NOT NULL DEFAULT 'APROBADO'` o `UPDATE` explícito en la migración); ningún recurso
      previo sin estado.

## 2. Dominio (`src/modules/recursos/domain`)

- [ ] Enum `EstadoAprobacionRecurso` (const-object + unión, mismos valores que Prisma).
- [ ] Ampliar la entidad `Recurso` con `estadoAprobacion` y `propuestoPorId`.
- [ ] Ampliar `NuevoRecurso` para el estado inicial y `propuestoPorId` según origen.
- [ ] Regla `esSeleccionable(recurso)` = `estadoAprobacion === APROBADO && activo`.
- [ ] Máquina de revisión pura: transiciones `PROPUESTO → APROBADO` | `PROPUESTO → RECHAZADO`.
- [ ] Ampliar `FiltroRecursos` con `estadoAprobacion` y `soloSeleccionables`.

## 3. Aplicación (`src/modules/recursos/application`)

- [ ] `proponerRecurso` (normaliza, valida, rechaza duplicado, crea en `PROPUESTO` con `propuestoPor`).
- [ ] `aprobarPropuesta` / `rechazarPropuesta` (solo `PROPUESTO`; error si no).
- [ ] `listarPropuestas` (recursos `PROPUESTO` para la bandeja).
- [ ] Ajustar `crearRecurso`: nace `APROBADO`, `propuestoPorId = null`.
- [ ] Ajustar `listarRecursos`: soportar `soloSeleccionables` (para 005/006).
- [ ] Errores (`PropuestaNoEncontradaError`, `TransicionAprobacionInvalidaError`).
- [ ] Mantener la capa pura (solo depende de `domain`).

## 4. Infraestructura

- [ ] Ampliar `PrismaRecursoRepository`: mapear `estadoAprobacion` y `propuestoPorId` (sin casts),
      filtrar por `estadoAprobacion` y `soloSeleccionables`, persistir los campos nuevos.

## 5. Presentación

- [ ] **Solicitante (flujo 007):** en `SolicitudForm`, opción **"Proponer nuevo recurso"** cuando el
      recurso no existe; mini-formulario (`nombre`, `unidad`, `categoria`, `descripcion?`).
- [ ] Server action `proponerRecursoAction`: `zod`, `requireRol(SOLICITANTE)`, caso de uso,
      `revalidatePath`.
- [ ] **Admin:** **bandeja de propuestas** bajo `/(admin)/panel/recursos` (`PropuestasTabla` con
      `propuestoPor` y fecha `DD/MM/AAAA` vía Luxon `es-VE`).
- [ ] Acciones **aprobar** / **rechazar** (botones `<form>` + server action) y enlace a **editar**
      antes de aprobar (reusa 004).
- [ ] Server actions `aprobarPropuestaAction` / `rechazarPropuestaAction`: `zod`, `requireRol(ADMIN)`,
      caso de uso, `revalidatePath`.
- [ ] Ampliar `RecursosTabla` (004) para mostrar la etiqueta de `estadoAprobacion`.
- [ ] Selectores de 005 (`MetaRecurso`) y 006 (`Aporte`) consumen `soloSeleccionables`.
- [ ] Confirmar que `proxy.ts` cubre la ruta de propuesta del solicitante y la bandeja del admin.

## 6. Composición (wiring)

- [ ] Exponer los casos de uso nuevos desde la fachada del módulo `recursos` sin romper los límites de
      capas; `app`/`ui` no importan `infrastructure`/`lib` directamente.

## 7. Tests (Vitest)

- [ ] `proponerRecurso`: crea en `PROPUESTO` con `propuestoPor`; rechaza duplicado; normaliza; rechaza
      unidad vacía / categoría inválida.
- [ ] `crearRecurso` (regresión): nace `APROBADO`, `propuestoPorId = null`.
- [ ] `aprobarPropuesta` / `rechazarPropuesta`: transición válida desde `PROPUESTO`; error si no lo
      está.
- [ ] `esSeleccionable`: `APROBADO + activo` → true; `PROPUESTO` / `RECHAZADO` / archivado → false.
- [ ] `listarRecursos({ soloSeleccionables })`: excluye `PROPUESTO`/`RECHAZADO`/archivados.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada; recursos previos quedaron `APROBADO`.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `SOLICITANTE`, proponer un recurso y comprobar que no aparece en metas/aportes;
      como `ADMIN`, aprobarlo desde la bandeja y comprobar que ya es seleccionable; rechazar otro y
      comprobar que no aparece.

## 9. Cierre

- [ ] Revisar que `recursos/domain` y `recursos/application` siguen puras (sin framework/Prisma).
- [ ] Verificar que `DOC/features/019-propuesta-de-recursos-por-solicitante.md` refleja lo entregado.
- [ ] Enmendar la `spec` y el `DOC` de `004 · Catálogo de recursos` para mencionar el
      `estadoAprobacion`.
- [ ] Mover `019 · Propuesta de recursos por el solicitante` a **Hecho ✅** en
      `constitution/roadmap.md`.
