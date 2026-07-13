# 026 · Plan de implementación

> Enfoque técnico de la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, capas puras,
> Estilo visual). Orden pensado para que cada paso compile y deje el árbol coherente.

## Estrategia

Tres partes independientes que comparten superficie:

- **A** (red apta visible): solo lectura nueva en `afiliaciones` + UI en `ActividadForm`.
- **B** (multi-centro): cambio de modelo (`Actividad.puntoAcopioId` -> tabla puente
  `ActividadPuntoAcopio`), que atraviesa dominio, aplicación, infraestructura, UI y migración.
- **C** (rediseño): solo presentación de las vistas de aporte y detalle.

Se implementa **B primero** (toca el modelo y las firmas que todo lo demás usa), luego **A**, luego **C**.

## Paso 1 · Modelo Prisma y migración (B)

- `prisma/schema.prisma`:
  - Nuevo `model ActividadPuntoAcopio`:
    ```
    model ActividadPuntoAcopio {
      id            String      @id @default(cuid())
      actividadId   String
      actividad     Actividad   @relation(fields: [actividadId], references: [id], onDelete: Cascade)
      puntoAcopioId String
      puntoAcopio   PuntoAcopio @relation(fields: [puntoAcopioId], references: [id], onDelete: Cascade)
      createdAt     DateTime    @default(now())
      @@unique([actividadId, puntoAcopioId])
      @@index([actividadId])
      @@index([puntoAcopioId])
      @@map("actividad_punto_acopio")
    }
    ```
  - En `Actividad`: eliminar `puntoAcopioId`, `puntoAcopio` y `@@index([puntoAcopioId])`; añadir
    `puntosAcopio ActividadPuntoAcopio[]`.
  - En `PuntoAcopio`: cambiar `actividades Actividad[]` por `actividades ActividadPuntoAcopio[]`.
- **Migración** `026_actividad_multi_punto_acopio` (crear con `prisma migrate dev --name
  actividad_multi_punto_acopio`, luego editar el SQL para intercalar el backfill **antes** del
  `DROP COLUMN`). SQL en este orden:
  1. `CREATE TABLE "actividad_punto_acopio" (...)` + índices + unique + FKs (Cascade).
  2. `INSERT INTO "actividad_punto_acopio" (id, "actividadId", "puntoAcopioId", "createdAt")
     SELECT gen_random_uuid()::text, id, "puntoAcopioId", now() FROM "actividades"
     WHERE "puntoAcopioId" IS NOT NULL;` (backfill; `gen_random_uuid` disponible en PG 16).
  3. `DROP INDEX` del índice de `puntoAcopioId`, `ALTER TABLE "actividades" DROP CONSTRAINT` de la FK,
     `ALTER TABLE "actividades" DROP COLUMN "puntoAcopioId";`.
- Verificar con `prisma migrate status` y `prisma generate`.

## Paso 2 · Dominio (B)

- `actividades/domain/Actividad.ts`:
  - Nuevo tipo `PuntoAcopioDeActividad = { id: string; nombre: string; referencia: string; horarios:
    string }` (datos que necesita "Dónde entregar").
  - `Actividad`: sustituir `puntoAcopioId: string | null` por `puntosAcopio: PuntoAcopioDeActividad[]`.
  - `NuevaActividad`/`CambiosActividad`: `puntoAcopioId` -> `puntosAcopioIds: string[]`
    (en `CambiosActividad` es opcional; presente = reemplazar el set completo).
- `actividades/domain/reglas.ts`: `dedupeIds(ids: string[]): string[]` puro (mantiene orden, sin
  repetidos, descarta vacíos/espacios).

## Paso 3 · Aplicación (B)

- `application/deps.ts`: añadir `validarPuntosAcopio(puntos, ids, adminId)` que deduplica y valida cada
  id con la lógica de `validarPuntoAcopio` (existe, activo, propio). Mantener `validarPuntoAcopio` para
  reutilizarla dentro del bucle.
- `application/crearActividad.ts`: `puntoAcopioId?` -> `puntosAcopioIds?: string[]`; dedupe + validar si
  no vacío; pasar `puntosAcopioIds` a `actividades.crear`.
- `application/editarCabecera.ts`: `puntoAcopioId?` -> `puntosAcopioIds?: string[]`; si viene, validar
  cada uno y set `cambios.puntosAcopioIds` (deduplicado).
- `obtenerActividad.ts`: sin cambios de firma (ya devuelve la `Actividad` enriquecida por el repo).

## Paso 4 · Infraestructura y fakes (B)

- `infrastructure/PrismaActividadRepository.ts`:
  - `INCLUDE_METAS` -> incluir también `puntosAcopio: { include: { puntoAcopio: true },
    orderBy: { puntoAcopio: { nombre: "asc" } } }`.
  - `mapearActividad`: mapear `puntosAcopio` a `PuntoAcopioDeActividad[]`.
  - `crear`: `puntosAcopio: { create: ids.map((puntoAcopioId) => ({ puntoAcopioId })) }`.
  - `actualizarCabecera`: separar los escalares de `puntosAcopioIds`; si viene, `puntosAcopio:
    { deleteMany: {}, create: ids.map(...) }`.
- `application/fakes.ts` (`InMemoryActividadRepository`): almacenar `puntosAcopio` a partir de
  `datos.puntosAcopioIds` (objetos con `id` = id del punto, `nombre`/`referencia`/`horarios` vacíos,
  suficiente para los tests de aplicación); `actualizarCabecera` reemplaza el set cuando llega.
- `lib/actividades.ts`: sin cambios (ya inyecta `puntos`).

## Paso 5 · Aplicación + infraestructura (A · red apta)

- `afiliaciones/application/consultarRed.ts`: `listarRedAptaPorCategoria(deps, adminId):
  Promise<Record<CategoriaRecurso, MiembroRedApto[]>>` reutilizando `afiliaciones.listarRed(adminId)`
  (toda la red, verificados y no) y agrupando por cada categoría declarada. `MiembroRedApto =
  { colaboradorId, nombre, categorias, verificado }` (sin contacto).
- `lib/afiliaciones.ts` + `shared/afiliaciones/index.ts`: exponer
  `listarRedAptaPorCategoriaServicio` y el tipo `MiembroRedApto`.
- No hace falta método nuevo en el repositorio: se deriva de `listarRed`.

## Paso 6 · Presentación (A + B)

- `actividades/ui/ActividadForm.tsx`:
  - Prop `puntoAcopioId` de `ActividadFormValores` -> `puntosAcopioIds: string[]`.
  - Selector único -> **checkboxes** de `puntosAcopio` (0..N), con `Controller`.
  - Nueva prop `redPorCategoria?: Record<CategoriaRecurso, MiembroRedApto[]>`. Junto al conteo por meta,
    botón **"+ info"** (aria-expanded) que despliega en línea `<RedAptaLista>` de esa categoría. Sin
    "+ info" cuando la lista está vacía.
- Nuevo `afiliaciones/ui/RedAptaLista.tsx`: lista de solo lectura (nombre + categorías + badge
  verificación). Reutiliza etiquetas de `ui/categorias.ts`.
- `app/(admin)/panel/actividades/nueva/page.tsx` y `.../[id]/editar/page.tsx`: cargar
  `listarRedAptaPorCategoriaServicio(sesion.id)` y pasar `redPorCategoria`; `valoresIniciales.
  puntosAcopioIds` desde `ayuda.puntosAcopio.map(p => p.id)`.
- `app/(admin)/panel/actividades/actions.ts`: `CabeceraSchema` cambia `puntoAcopioId` por
  `puntosAcopioIds: z.array(z.string()).optional()`; `ActividadInput` idem; mapear a
  `puntosAcopioIds` en `crear`/`editar`.
- `app/(app)/actividades/[id]/page.tsx`: bloque "Dónde entregar" con `ayuda.puntosAcopio` (nombre,
  referencia, horarios); no renderiza si está vacío.

## Paso 7 · Rediseño (C)

- Leer la sección "Estilo visual" de `constitution/tech-stack.md` (hecho) y aplicar: heading
  `font-serif`, metadatos con separadores y `numeric-tnum`, hairlines, `--ease-out-emil`, iconos
  `lucide` `strokeWidth={1.5}`, `prefers-reduced-motion`.
- Rediseñar `app/(app)/actividades/[id]/page.tsx`, `app/(app)/actividades/[id]/aportar/page.tsx`,
  `aportes/ui/AporteForm.tsx`, `aportes/ui/ProgresoMetas.tsx`, `aportes/ui/AportantesTabla.tsx` sin
  cambiar sus contratos de datos.
- Guía de calidad: skills `/interface-design`, `/emil-design-eng`, `/impeccable`; la constitución manda
  en conflicto.

## Paso 8 · Tests y cierre

- Vitest:
  - `crearActividad.test.ts` / `editarCabecera.test.ts`: asignar varios puntos propios; rechazar ajeno o
    archivado dentro del array; deduplicar; permitir vacío. Adaptar los asserts de `puntoAcopioId` a
    `puntosAcopio`.
  - Nuevo `afiliaciones`: `listarRedAptaPorCategoria` agrupa por categoría e ignora contacto.
  - `reglas` de actividades: `dedupeIds`.
- `pnpm test`, `pnpm exec eslint src`, `pnpm build` en verde.
- `DOC/features/026-*.md` y `constitution/roadmap.md` (mover 026 a Hecho; anotar enmienda 024/025).

## Riesgos y notas

- **Migración destructiva** (drop de `puntoAcopioId`): backfill antes del drop, en la misma migración.
  Base local ya reseteada y alineada al historial del repo.
- **Barrido de referencias a `puntoAcopioId`:** dominio, aplicación, infra, fakes, tests, `actions.ts`,
  páginas `nueva`/`editar`. No dejar ninguna colgada.
- **Pureza de capas:** `domain`/`application` sin Prisma ni React (ESLint lo verifica). La agrupación de
  red apta vive en `application`, no en el repo.
- **Constitución sobre skills** en el rediseño; sin em-dash, sin `transition: all`, solo `transform`/
  `opacity`.
