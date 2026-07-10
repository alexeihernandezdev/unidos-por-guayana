# 023 · Registro de aportantes visible al colaborador — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. Es una **enmienda aditiva** a
> `src/modules/aportes` (006): **sin** modelo ni migración; solo exponer una lectura nueva.

## 0. Preparación

- [x] Repasar `aportes`: `application/listarAportes.ts`, `infrastructure/PrismaAporteRepository.ts`,
      `ui/{AportesTabla,EstadoAporteBadge}.tsx` y el detalle `src/app/ayudas/[id]`.
- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` antes de tocar el server component.
- [x] Confirmar cómo se obtiene la sesión (helper de 002).

## 1. Datos

- [x] **Sin cambios en `schema.prisma` ni migración** (el `Aporte` ya tiene todo lo necesario).

## 2. Aplicación (`src/modules/aportes/application`)

- [x] DTO de reconocimiento: `{ id, aportanteNombre, recursoNombre, recursoUnidad, cantidad, estado,
      fecha }` (sin datos de contacto).
- [x] Reutilizar `listarAportesPorAyuda` o añadir `listarAportantesDeAyuda` que devuelva ese DTO. Capa pura.

## 3. Infraestructura

- [x] `PrismaAporteRepository`: `select` explícito `colaborador: { nombre }` (sin cédula/teléfono/correo),
      recurso (`nombre`, `unidad`), `cantidad`, `estado`, `createdAt`; `orderBy createdAt desc`; `Decimal`
      → `number`.

## 4. Presentación (`src/app/ayudas/[id]` + `ui`)

- [x] Sección "Quiénes han aportado" en el detalle, gated por sesión (sin login no hay nombres).
- [x] Componente `AportantesTabla`: nombre, recurso, cantidad, `EstadoAporteBadge`, fecha (Luxon `es-VE`).
- [x] Estado vacío claro ("Todavía no hay aportes...").
- [x] Solo lectura: sin acciones.
- [x] Sin em-dash (`—`) / en-dash (`–`) en textos visibles.

## 5. Tests (Vitest)

- [x] La lectura devuelve `aportanteNombre` **sin** campos de contacto (aserción explícita).
- [x] Orden por fecha desc.
- [x] Estado vacío manejado.

## 6. Validación final

- [x] `pnpm test` en verde.
- [x] `pnpm lint` / `pnpm build` sin errores.
- [x] `pnpm dev`: como `COLABORADOR`, ver el registro de aportantes de una actividad con varias personas;
      sin sesión no aparecen nombres; `/transparencia` sigue anónima.

## 7. Cierre

- [x] `aportes/domain` y `aportes/application` siguen puras.
- [x] `DOC/features/023-registro-de-aportantes-colaborador.md` refleja lo entregado.
- [x] Mover `023` a **Hecho ✅** en `constitution/roadmap.md` (enmienda 006); revisar que el DOC de 006
      sigue fiel.
