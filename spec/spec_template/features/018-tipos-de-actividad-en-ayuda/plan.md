# 018 · Tipos de actividad en Ayuda — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming,
> pureza de capas, convenciones y límites duros). Es una **enmienda aditiva** al módulo
> `src/modules/ayudas` (feature 005): no se crea módulo nuevo.

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación), tocando lo mínimo
sobre lo ya construido en 005. Orden:
**campo `tipo` + enum + migración con backfill → dominio (`TipoActividad` + entidad) → aplicación
(crear valida `tipo`, listar filtra por `tipo`) → repositorio Prisma (mapea/filtra `tipo`) → UI
(selección de tipo al crear, renombrado de la acción, filtro y presentación por tipo) → validación**.

> ⚠️ Las server actions y server components de la gestión de Ayudas ya existen (005). Antes de tocarlas,
> leer la guía de Next 16 en `node_modules/next/dist/docs/` (AGENTS.md). La protección por rol reutiliza
> la feature 002 (`requireRol(ADMIN)`).

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`:
  - `enum TipoActividad { ENVIO JORNADA EVENTO_SOCIAL }`.
  - En `model Ayuda`: `tipo TipoActividad @default(ENVIO)`.
- Migración `add_tipo_actividad`:
  1. Crear el enum `TipoActividad`.
  2. Añadir la columna `tipo` a `ayudas` con default `ENVIO` (las filas existentes quedan en `ENVIO` por
     el default → **backfill** implícito; si el motor lo requiere, un `UPDATE` explícito antes de fijar
     `NOT NULL`).
  3. Fijar `NOT NULL`.
- `pnpm db:migrate` con la base de Docker arriba.

## 2. Capa de dominio (`src/modules/ayudas/domain`) — pura

- Nuevo `TipoActividad` (const-object + unión, mismos valores que Prisma), en el patrón de
  `EstadoAyuda.ts`.
- En `Ayuda.ts`: añadir `tipo: TipoActividad` a la entidad `Ayuda` y a `NuevaAyuda`. **No** añadirlo a
  `CambiosAyuda` (el `tipo` no se edita tras el alta).
- En `reglas.ts`: validar que `tipo` es un valor válido de `TipoActividad` al construir una `NuevaAyuda`.
- Exportar `TipoActividad` desde el barril `domain/index.ts`.

## 3. Capa de aplicación (`src/modules/ayudas/application`) — pura

- `crearAyuda`: aceptar `tipo` en el input, validarlo (vía las reglas de dominio) y persistirlo. El resto
  del flujo (metas, `RECOLECTANDO`) no cambia.
- `listarAyudas`: extender el filtro para aceptar `tipo?` (opcional), combinable con el filtro por
  `estado?` ya existente. La firma del filtro pasa a `{ estado?; tipo? }`.
- `obtenerAyuda`: sin cambios de lógica (el `tipo` viaja en la entidad).
- `editarCabecera`: sin cambios; al no incluir `tipo` en `CambiosAyuda`, queda inmutable por
  construcción.
- Mantener la capa **pura** (solo `domain` + contrato de `RecursoRepository`). Actualizar los dobles en
  `fakes.ts` para contemplar `tipo`.

## 4. Infraestructura (`src/modules/ayudas/infrastructure`)

- `PrismaAyudaRepository`:
  - Mapear `tipo` en la lectura (fila → entidad) y en la escritura (alta).
  - Aplicar el filtro por `tipo` en `listar` (junto al de `estado`) construyendo el `where` de Prisma.
  - Sin casts de enums a mano; usar los valores del enum de Prisma.

## 5. Presentación (`src/modules/ayudas/ui` + `src/app`) — solo `ADMIN`

- **Mapa de presentación por tipo** (junto a `estados.ts`, p. ej. `tipos.ts`): para cada
  `TipoActividad`, su **nombre singular** (para títulos y botones: "envío" / "jornada" / "evento
  social") y su **etiqueta de badge**. Único punto de verdad de los copys por tipo.
- **Alta** (`/(admin)/panel/ayudas/nueva`): añadir la **selección del `tipo`** (por defecto la pantalla
  puede venir preseleccionada por query, p. ej. `?tipo=JORNADA`, o pedir elegir). Título de pantalla y
  botón se **renombran** con el mapa ("Crear envío" / "Crear jornada" / "Crear evento social").
  `AyudaForm` incluye el `tipo` en el submit (deshabilitado/oculto para edición, ya que no aplica).
- **Listado** (`/(admin)/panel/ayudas`): mostrar el `tipo` (badge/columna) en `AyudasTabla` y añadir un
  **filtro por tipo** junto al filtro por estado existente.
- **Detalle** (`/(admin)/panel/ayudas/[id]`): usar el mapa para presentar la cabecera con el vocabulario
  del tipo.
- **Server actions**: la de crear pasa a aceptar y validar `tipo` con `zod` (enum de los tres valores);
  las de editar cabecera **no** aceptan `tipo`. Mantener `requireRol(ADMIN)` y `revalidatePath`.
- `EstadoBadge` no cambia; se añade la presentación de tipo aparte (no mezclar estado y tipo en un mismo
  badge).

## 6. Composición (wiring)

- Sin nuevos repositorios ni casos de uso: solo se extienden firmas. Respetar los límites de capas
  (`app`/`ui` no importan `infrastructure`/`lib` directamente), como en 005.

## 7. Tests (Vitest)

- Reglas de dominio: `tipo` válido / inválido.
- `crearAyuda`: crea con cada `tipo`; rechaza `tipo` inválido; el resto de invariantes de 005 siguen.
- `listarAyudas`: filtra por `tipo`, por `estado` y por ambos combinados.
- `editarCabecera`: no puede cambiar el `tipo` (no está en `CambiosAyuda`).
- Confirmar que **todos los tests de 005 siguen en verde** tras el cambio aditivo.

## Decisiones

- **Enmienda aditiva, no reescritura:** se reutiliza el módulo `ayudas`; el `tipo` es un campo más.
- **`tipo` inmutable tras el alta:** propiedad de identidad; fuera de `CambiosAyuda`.
- **Sin ramificar la lógica por tipo:** el ciclo de vida y las metas son idénticos; el `tipo` solo
  afecta a la presentación (mapa de copys en `ui`).
- **Backfill a `ENVIO`:** coherente con el origen de 005 y con `@default(ENVIO)` para altas futuras.
- **Copys centralizados:** un solo mapa por tipo evita inconsistencias entre alta, listado y detalle.

## Validación final

1. `docker compose up -d` y `pnpm db:migrate` (migración `add_tipo_actividad` aplicada; filas previas en
   `ENVIO`).
2. `pnpm test` (reglas, `crearAyuda`, `listarAyudas`, `editarCabecera`, y suite de 005 en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN`, crear una **jornada** y un **evento social**, comprobar el renombrado de la
   acción, filtrar el listado por tipo, y verificar que la edición de cabecera no cambia el `tipo`;
   confirmar que un no-`ADMIN` no accede.

## Al terminar

- Actualizar `constitution/roadmap.md`: mover `018 · Tipos de actividad en Ayuda` a **Hecho ✅** y dejar
  constancia de que **enmienda 005**.
- Verificar que `DOC/features/018-tipos-de-actividad-en-ayuda.md` refleja lo entregado.
- Revisar que `DOC/features/005-ayudas-envio.md` sigue fiel (o anotar que el envío es ahora un tipo entre
  tres).
