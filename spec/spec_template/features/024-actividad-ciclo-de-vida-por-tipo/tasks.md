# 024 · Tareas

## Base de datos
- [x] `schema.prisma`: `model Ayuda` -> `Actividad` (`@@map("actividades")`); `EstadoAyuda` ->
      `EstadoActividad` con 7 valores; `horaFin`, `puntoAcopioId` + relación con `PuntoAcopio`.
- [x] `MetaRecurso`/`Aporte`: `ayudaId` -> `actividadId`; `Usuario.ayudas` -> `actividades`;
      `PuntoAcopio` gana inversa `actividades`.
- [x] Migración 1: rename type + add values + rename tabla/columnas/FK/índices + columnas nuevas.
- [x] Migración 2: backfill de estados de `JORNADA`/`EVENTO_SOCIAL`.
- [x] `prisma migrate deploy` + `prisma generate` en verde (sin drift).

## Dominio (actividades)
- [x] `EstadoActividad.ts`: uniones `Envio`, `Evento` y unión total + guards.
- [x] `maquinaEstados.ts`: secuencia y transiciones por `tipo`; `esEditable`/`esEliminable`;
      `remapearAEstadoEvento` (backfill puro).
- [x] `Actividad.ts`, `ActividadRepository.ts`, `reglas.ts`.
- [x] Tests: transiciones válidas/inválidas por tipo, remapeo backfill, propiedad `esDueño`.

## Aplicación
- [x] Rename de casos de uso, `deps`, `fakes`, `errors`.
- [x] `crearActividad`/`editarCabecera`: `horaFin`, `puntoAcopioId` con validación de propiedad.
- [x] `avanzarEstado`: máquina por `tipo`.
- [x] Tests: `puntoAcopioId` propio aceptado, ajeno rechazado, `horaFin` guardada.

## Infraestructura
- [x] `PrismaActividadRepository` mapea `horaFin`/`puntoAcopioId` y usa `actividadId_recursoId`.
- [x] Composition root `lib/actividades.ts` cablea `PrismaPuntoAcopioRepository`.

## Presentación / rutas
- [x] Mover `/ayudas/*` y `/panel/ayudas/*` a `/actividades/*` y `/panel/actividades/*`.
- [x] Actualizar `navConfig`, enlaces internos y fachadas (`@/shared/actividades`, `@/lib/actividades`).
- [x] UI: etiqueta de estado por `tipo`, selector de punto de acopio, campo `horaFin`.

## Consumidores
- [x] 006, 008, 009, 023 actualizados a `actividad`/`actividadId`.

## Cierre
- [x] `pnpm test` (290+ tests), `pnpm exec eslint src`, `pnpm build` en verde.
- [x] `DOC/features/024-actividad-ciclo-de-vida-por-tipo.md`.
- [x] `roadmap.md`: 024 a Hecho; `tech-stack.md` actualizado (entidad Actividad, ciclo por tipo).
