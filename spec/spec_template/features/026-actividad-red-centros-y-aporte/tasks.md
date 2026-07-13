# 026 · Tareas

Checklist de implementación. Estado: **completada**.

## B · Multi-centro (modelo -> UI)

- [x] Schema: `model ActividadPuntoAcopio` (puente, unique + índices, FKs Cascade).
- [x] Schema: quitar `Actividad.puntoAcopioId`/`puntoAcopio`/`@@index`; añadir `puntosAcopio`.
- [x] Schema: `PuntoAcopio.actividades` pasa a `ActividadPuntoAcopio[]`.
- [x] Migración `actividad_multi_punto_acopio`: crear tabla, backfill desde `puntoAcopioId`, drop columna.
- [x] `prisma migrate dev` aplicada + `prisma generate`.
- [x] Dominio: `PuntoAcopioDeActividad`; `Actividad.puntosAcopio`; `Nueva/CambiosActividad.
      puntosAcopioIds`.
- [x] Dominio: `dedupeIds` en `reglas.ts`.
- [x] Aplicación: `validarPuntosAcopio` en `deps.ts`.
- [x] Aplicación: `crearActividad` y `editarCabecera` con `puntosAcopioIds`.
- [x] Infra: `PrismaActividadRepository` mapea/persiste la puente (crear + reemplazo en editar).
- [x] Fakes: `InMemoryActividadRepository` almacena `puntosAcopio`.
- [x] Actions/schema/páginas: `puntosAcopioIds` en `nueva`, `editar`, `actions.ts`.
- [x] Form: checkboxes multi-punto.
- [x] Detalle: bloque "Dónde entregar".

## A · Red apta visible

- [x] Aplicación: `listarRedAptaPorCategoria` + tipo `MiembroRedApto` (sin contacto).
- [x] `lib` + `shared`: servicio y tipo expuestos.
- [x] UI: `RedAptaLista` (nombre, categorías, badge verificación).
- [x] Form: botón "+ info" por meta que despliega la lista de la categoría del recurso.
- [x] Página `nueva`: carga y pasa `redPorCategoria` (el form de edición no muestra metas).

## C · Rediseño (solo presentación)

- [x] `/actividades/[id]` rediseñada (jerarquía editorial + "Dónde entregar").
- [x] `/actividades/[id]/aportar` rediseñada.
- [x] `AporteForm` pulido.
- [x] `ProgresoMetas` y `AportantesTabla` pulidos (sin cambiar contrato).
- [x] Restricciones duras de la constitución verificadas (sin em-dash, motion, hairlines, lucide 1.5).

## Cierre

- [x] Vitest: multi-punto (propio/ajeno/dedupe/vacío), red apta agrupada sin contacto, `dedupeIds`.
- [x] Regresión: 335 tests en verde (61 archivos). Único rojo preexistente y ajeno:
      `aportes/registrarAporteExterno.test.ts` importa el módulo eliminado `@/modules/ayudas` (residuo del
      rename 024, feature 014); no se toca aquí.
- [x] `pnpm exec eslint src` limpio (solo warning preexistente en `PuntoAcopioForm.tsx`).
- [x] `pnpm build` limpio.
- [x] `DOC/features/026-actividad-red-centros-y-aporte.md`.
- [x] `constitution/roadmap.md`: 026 a Hecho, enmienda 024/025 anotada.
