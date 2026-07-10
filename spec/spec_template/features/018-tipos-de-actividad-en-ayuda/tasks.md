# 018 · Tipos de actividad en Ayuda — Tareas

> Checklist de implementación. Marcar el progreso conforme se avanza. El orden respeta las
> dependencias descritas en `plan.md`. Es una **enmienda aditiva** al módulo `src/modules/ayudas`
> (feature 005): reutilizar lo existente, no reescribir.

## 0. Preparación

- [x] Repasar el módulo `ayudas` (005): `domain/EstadoAyuda.ts`, `domain/Ayuda.ts`, `domain/reglas.ts`,
      `application/crearAyuda.ts`, `application/listarAyudas.ts`, `infrastructure/PrismaAyudaRepository.ts`
      y `ui/` (`AyudaForm`, `AyudasTabla`, `estados.ts`).
- [x] Leer la guía de Next.js 16 en `node_modules/next/dist/docs/` (server actions, server components)
      antes de tocar la gestión existente.
- [ ] Levantar la base: `docker compose up -d`. (No disponible en el entorno del agente; sin Docker.)

## 1. Modelo de datos y migración

- [x] Añadir a `schema.prisma`: enum `TipoActividad { ENVIO JORNADA EVENTO_SOCIAL }` y el campo
      `tipo TipoActividad @default(ENVIO)` en `model Ayuda`.
- [x] Migración `add_tipo_actividad`: crear el enum, añadir la columna con default `ENVIO` (**backfill**
      de filas existentes a `ENVIO`) y fijar `NOT NULL`. Validar el schema (`prisma validate`).
- [ ] Aplicar con `pnpm db:migrate` cuando haya base disponible.

## 2. Dominio (`src/modules/ayudas/domain`)

- [x] `TipoActividad` (const-object + unión, mismos valores que Prisma), en el patrón de `EstadoAyuda`.
- [x] Añadir `tipo: TipoActividad` a la entidad `Ayuda` y a `NuevaAyuda`. **No** añadirlo a
      `CambiosAyuda` (inmutable tras el alta).
- [x] En `reglas.ts`: validar `tipo` como valor válido de `TipoActividad` al crear.
- [x] Exportar `TipoActividad` desde `domain/index.ts`.

## 3. Aplicación (`src/modules/ayudas/application`)

- [x] `crearAyuda`: aceptar, validar y persistir `tipo`; resto del flujo intacto.
- [x] `listarAyudas`: extender el filtro a `{ estado?; tipo? }`, combinables.
- [x] `obtenerAyuda` / `editarCabecera`: sin cambios de lógica (el `tipo` viaja en la entidad y no está
      en `CambiosAyuda`).
- [x] Actualizar los dobles en `fakes.ts` para contemplar `tipo`.
- [x] Mantener la capa pura (solo `domain` + contrato de `RecursoRepository`).

## 4. Infraestructura

- [x] `PrismaAyudaRepository`: mapear `tipo` en lectura y escritura; aplicar filtro por `tipo` en
      `listar` (junto al de `estado`), sin casts de enums a mano.

## 5. Presentación (solo `ADMIN`)

- [x] Mapa de presentación por tipo en `ayudas/ui` (p. ej. `tipos.ts`): nombre singular + etiqueta de
      badge por cada `TipoActividad`. Único punto de verdad de los copys por tipo.
- [x] **Alta** `/(admin)/panel/ayudas/nueva`: selección del `tipo` y **renombrado** de título/botón
      ("Crear envío" / "Crear jornada" / "Crear evento social"); `AyudaForm` envía el `tipo`.
- [x] **Listado** `/(admin)/panel/ayudas`: mostrar el `tipo` en `AyudasTabla` y añadir **filtro por
      tipo** junto al de estado.
- [x] **Detalle** `/(admin)/panel/ayudas/[id]`: presentar la cabecera con el vocabulario del tipo.
- [x] Server action de crear: aceptar y validar `tipo` con `zod` (enum de tres valores); las de editar
      cabecera **no** aceptan `tipo`. Mantener `requireRol(ADMIN)` y `revalidatePath`.
- [x] Sin em-dash (`—`) / en-dash (`–`) en los textos por tipo; fechas con Luxon (`es-VE`, `DD/MM/AAAA`).

## 6. Composición (wiring)

- [x] Sin nuevos repos/casos de uso: solo extender firmas. Respetar los límites de capas (`app`/`ui` no
      importan `infrastructure`/`lib` directamente).

## 7. Tests (Vitest)

- [x] Reglas de dominio: `tipo` válido / inválido.
- [x] `crearAyuda`: crea con cada `tipo`; rechaza `tipo` inválido.
- [x] `listarAyudas`: filtra por `tipo`, por `estado` y por ambos combinados.
- [x] `editarCabecera`: el `tipo` no puede cambiar.
- [x] Confirmar que **toda la suite de 005 sigue en verde** tras el cambio aditivo.

## 8. Validación final

- [ ] `docker compose up -d` y base `healthy`. (No disponible en el entorno del agente; sin Docker.)
- [ ] `pnpm db:migrate` aplicada (`add_tipo_actividad`; filas previas en `ENVIO`).
- [x] `pnpm test` en verde (incluida la suite de 005).
- [x] `pnpm lint` / `pnpm build` sin errores.
- [ ] `pnpm dev`: como `ADMIN`, crear una **jornada** y un **evento social**, comprobar el renombrado de
      la acción, filtrar por tipo y verificar que la edición de cabecera no cambia el `tipo`; un
      no-`ADMIN` no accede. (Pendiente de prueba manual: requiere base de datos.)

## 9. Cierre

- [x] Revisar que `ayudas/domain` y `ayudas/application` siguen puras (sin framework/Prisma).
- [x] Verificar que `DOC/features/018-tipos-de-actividad-en-ayuda.md` refleja lo entregado.
- [x] Mover `018 · Tipos de actividad en Ayuda` a **Hecho ✅** en `constitution/roadmap.md` (dejando
      constancia de que enmienda 005) y revisar que `DOC/features/005-ayudas-envio.md` sigue fiel.
