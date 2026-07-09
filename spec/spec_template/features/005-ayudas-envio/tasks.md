# 005 · Ayudas / Envío — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar los módulos `usuarios` (002) y `recursos` (004).
- [ ] Levantar la base: `docker compose up -d`. Requiere el catálogo de la feature 004. (No disponible
      en el entorno del agente; sin Docker.)

## 1. Modelo de datos y migración

- [x] Añadir a `schema.prisma`: enum `EstadoAyuda`, modelo `Ayuda` y modelo `MetaRecurso`
      (`@@unique([ayudaId, recursoId])`, `cantidadObjetivo Decimal`), y la relación inversa `metas` en
      `Recurso`.
- [x] Migración `add_ayudas_metas` generada (vía `prisma migrate diff`) y schema válido
      (`prisma validate`). Pendiente aplicarla con `pnpm db:migrate` cuando haya base disponible.

## 2. Dominio (`src/modules/ayudas/domain`)

- [x] Enum `EstadoAyuda` (const-object + unión, mismos valores que Prisma).
- [x] Entidades `Ayuda` (con `metas`) y `MetaRecurso`; tipos `NuevaAyuda` / `NuevaMeta` / `CambiosAyuda`.
- [x] Máquina de estados: `TRANSICIONES`, `siguienteEstado`, `puedeAvanzar`, `esEditable` (+ `esEliminable`).
- [x] Validaciones puras (`cantidadObjetivo > 0`, campos no vacíos, no repetir recurso).
- [x] Contrato `AyudaRepository` (`crear`, `listar`, `buscarPorId`, `actualizarCabecera`, metas,
      `cambiarEstado`, `eliminar`).

## 3. Aplicación (`src/modules/ayudas/application`)

- [x] `crearAyuda` (valida metas contra recursos activos del catálogo; rechaza repetidos / cantidad ≤ 0).
- [x] `listarAyudas` (filtro por estado) y `obtenerAyuda` (detalle con metas).
- [x] `editarCabecera` y `gestionarMetas` (solo si `esEditable`).
- [x] `avanzarEstado` (transición válida; si no, error) y `eliminarAyuda` (solo `RECOLECTANDO`).
- [x] Errores de aplicación (`AyudaNoEncontradaError`, `TransicionInvalidaError`, `AyudaNoEditableError`,
      `RecursoInvalidoError`, `DatosAyudaInvalidosError`).
- [x] Mantener la capa pura (solo depende de `domain` + contrato de `RecursoRepository`).

## 4. Infraestructura

- [x] `PrismaAyudaRepository` sobre `@/lib/prisma` (crea/lee con `include: { metas }`, mapea
      `Decimal → number`, sin casts de enums).

## 5. Presentación (solo `ADMIN`)

- [x] Ruta **listado** `/(admin)/panel/ayudas` (filtro por estado; `requireRol(ADMIN)`).
- [x] Ruta **alta** `/(admin)/panel/ayudas/nueva` (`AyudaForm` con metas; selector de recursos activos).
- [x] Ruta **detalle** `/(admin)/panel/ayudas/[id]` (metas + estado + `AvanzarEstadoBoton`).
- [x] Ruta **edición** `/(admin)/panel/ayudas/[id]/editar` (solo si `RECOLECTANDO`).
- [x] Componentes en `ayudas/ui`: `AyudaForm`, `AyudasTabla`, `EstadoBadge`, `MetasEditor`,
      `AvanzarEstadoBoton`.
- [x] Server actions (crear/editar/metas/avanzar/eliminar): validan con `zod`, revalidan rol,
      invocan casos de uso compuestos y `revalidatePath`.
- [x] Formatear `fecha` con Luxon. Confirmar que `proxy.ts` cubre `/panel/ayudas`.

## 6. Composición (wiring)

- [x] Exponer la composición (repos de ayudas + recursos + casos de uso) sin romper los límites de
      capas (patrón de `@/shared/auth`).

## 7. Tests (Vitest)

- [x] Máquina de estados: transiciones válidas e inválidas; `esEditable`.
- [x] `crearAyuda`: crea; rechaza recurso inexistente/archivado, repetido o `cantidad ≤ 0`.
- [x] `editarCabecera` / `gestionarMetas`: bloquean fuera de `RECOLECTANDO`.
- [x] `avanzarEstado`: avanza y rechaza transición inválida.
- [x] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`. (No disponible en el entorno del agente; sin Docker.)
- [ ] `pnpm db:migrate` aplicada. (Pendiente: requiere base; la migración ya está generada y validada.)
- [x] `pnpm test` en verde (59 tests).
- [x] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, crear un envío con metas, editarlas en `RECOLECTANDO`, avanzar el
      estado por la secuencia válida (y comprobar que un salto se rechaza); un no-`ADMIN` no accede.
      (Pendiente de prueba manual: requiere base de datos.)

## 9. Cierre

- [x] Revisar que `ayudas/domain` y `ayudas/application` siguen puras (sin framework/Prisma).
- [x] Verificar que `DOC/features/005-ayudas-envio.md` refleja lo entregado.
- [x] Mover `005 · Ayudas / Envío` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `006 · Aportes` a **Siguiente 🔜**.
