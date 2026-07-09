# 005 · Ayudas / Envío — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`.

## 0. Preparación

- [ ] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (route handlers, server actions,
      server components) y repasar los módulos `usuarios` (002) y `recursos` (004).
- [ ] Levantar la base: `docker compose up -d`. Requiere el catálogo de la feature 004.

## 1. Modelo de datos y migración

- [ ] Añadir a `schema.prisma`: enum `EstadoAyuda`, modelo `Ayuda` y modelo `MetaRecurso`
      (`@@unique([ayudaId, recursoId])`, `cantidadObjetivo Decimal`), y la relación inversa `metas` en
      `Recurso`.
- [ ] `pnpm db:migrate` — migración `add_ayudas_metas` aplicada sin errores.

## 2. Dominio (`src/modules/ayudas/domain`)

- [ ] Enum `EstadoAyuda` (const-object + unión, mismos valores que Prisma).
- [ ] Entidades `Ayuda` (con `metas`) y `MetaRecurso`; tipos `NuevaAyuda` / `NuevaMeta` / `CambiosAyuda`.
- [ ] Máquina de estados: `TRANSICIONES`, `siguienteEstado`, `puedeAvanzar`, `esEditable`.
- [ ] Validaciones puras (`cantidadObjetivo > 0`, campos no vacíos, no repetir recurso).
- [ ] Contrato `AyudaRepository` (`crear`, `listar`, `buscarPorId`, `actualizarCabecera`, metas,
      `cambiarEstado`, `eliminar`).

## 3. Aplicación (`src/modules/ayudas/application`)

- [ ] `crearAyuda` (valida metas contra recursos activos del catálogo; rechaza repetidos / cantidad ≤ 0).
- [ ] `listarAyudas` (filtro por estado) y `obtenerAyuda` (detalle con metas).
- [ ] `editarCabecera` y `gestionarMetas` (solo si `esEditable`).
- [ ] `avanzarEstado` (transición válida; si no, error) y `eliminarAyuda` (solo `RECOLECTANDO`).
- [ ] Errores de aplicación (`AyudaNoEncontradaError`, `TransicionInvalidaError`, `AyudaNoEditableError`,
      `RecursoInvalidoError`).
- [ ] Mantener la capa pura (solo depende de `domain` + contrato de `RecursoRepository`).

## 4. Infraestructura

- [ ] `PrismaAyudaRepository` sobre `@/lib/prisma` (crea/lee con `include: { metas }`, mapea
      `Decimal → number`, sin casts de enums).

## 5. Presentación (solo `ADMIN`)

- [ ] Ruta **listado** `/(admin)/panel/ayudas` (filtro por estado; `requireRol(ADMIN)`).
- [ ] Ruta **alta** `/(admin)/panel/ayudas/nueva` (`AyudaForm` con metas; selector de recursos activos).
- [ ] Ruta **detalle** `/(admin)/panel/ayudas/[id]` (metas + estado + `AvanzarEstadoBoton`).
- [ ] Ruta **edición** `/(admin)/panel/ayudas/[id]/editar` (solo si `RECOLECTANDO`).
- [ ] Componentes en `ayudas/ui`: `AyudaForm`, `AyudasTabla`, `EstadoBadge`, `MetasEditor`,
      `AvanzarEstadoBoton`.
- [ ] Server actions (crear/editar/metas/avanzar/eliminar): validan con `zod`, revalidan rol,
      invocan casos de uso compuestos y `revalidatePath`.
- [ ] Formatear `fecha` con Luxon. Confirmar que `proxy.ts` cubre `/panel/ayudas`.

## 6. Composición (wiring)

- [ ] Exponer la composición (repos de ayudas + recursos + casos de uso) sin romper los límites de
      capas (patrón de `@/shared/auth`).

## 7. Tests (Vitest)

- [ ] Máquina de estados: transiciones válidas e inválidas; `esEditable`.
- [ ] `crearAyuda`: crea; rechaza recurso inexistente/archivado, repetido o `cantidad ≤ 0`.
- [ ] `editarCabecera` / `gestionarMetas`: bloquean fuera de `RECOLECTANDO`.
- [ ] `avanzarEstado`: avanza y rechaza transición inválida.
- [ ] Tests colocados junto a cada caso de uso; en verde.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`.
- [ ] `pnpm db:migrate` aplicada.
- [ ] `pnpm test` en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, crear un envío con metas, editarlas en `RECOLECTANDO`, avanzar el
      estado por la secuencia válida (y comprobar que un salto se rechaza); un no-`ADMIN` no accede.

## 9. Cierre

- [ ] Revisar que `ayudas/domain` y `ayudas/application` siguen puras (sin framework/Prisma).
- [ ] Verificar que `DOC/features/005-ayudas-envio.md` refleja lo entregado.
- [ ] Mover `005 · Ayudas / Envío` a **Hecho ✅** en `constitution/roadmap.md` y promover
      `006 · Aportes` a **Siguiente 🔜**.
