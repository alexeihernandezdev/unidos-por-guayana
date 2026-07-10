# 022 · Actividades por administrador — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, pureza de
> capas, convenciones y límites duros). Es una **enmienda aditiva** a `src/modules/ayudas` (005) y a las
> lecturas del panel (008): no se crea módulo nuevo.

## Enfoque general

De **adentro hacia afuera** (dominio → aplicación → infraestructura → presentación). Orden:
**campo `adminId` + migración con backfill → dominio (dueño en entidad + regla de propiedad) →
aplicación (crear fija dueño; listar/agrega filtran por `adminId`; gestión verifica propiedad) →
repositorio Prisma → UI del panel (pasar el `adminId` de sesión) → validación**.

> ⚠️ Las server actions/components de gestión ya existen (005/018). Antes de tocarlas leer la guía de
> Next 16 en `node_modules/next/dist/docs/` (AGENTS.md). La sesión y el rol se obtienen como en 002/015
> (`requireRol(ADMIN)`), de donde sale el `adminId` de la sesión.

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`:
  - En `model Ayuda`: `adminId String` + `admin Usuario @relation(fields: [adminId], references: [id])`
    y `@@index([adminId])`.
  - En `model Usuario`: relación inversa `ayudas Ayuda[]`.
- Migración `add_admin_a_ayuda` (dos pasos para no dejar nulos):
  1. Añadir `adminId` **nullable**.
  2. **Backfill**: `UPDATE ayudas SET "adminId" = <dueño>` donde `<dueño>` = id del `ADMIN` semilla
     (el sembrado por `db:seed`); si no existe, el primer `ADMIN` por `createdAt`; si tampoco, el
     `SUPERADMIN`. Resolver el id en la migración con un `SELECT` (o SQL condicional).
  3. Fijar `NOT NULL` y crear el índice + la FK.
- `pnpm db:migrate` con la base disponible.

## 2. Dominio (`src/modules/ayudas/domain`) — puro

- En `Ayuda.ts`: `adminId: string` en la entidad `Ayuda` y en `NuevaAyuda`. **No** en `CambiosAyuda`.
- En `reglas.ts`: helper puro `esDueño(ayuda, adminId): boolean` y un error de dominio
  `ActividadNoPerteneceAlAdmin` (o reutilizar el patrón de `errors.ts` de aplicación) para cuando la
  operación la pide quien no es el dueño.
- Exportar lo nuevo desde `domain/index.ts`.

## 3. Aplicación (`src/modules/ayudas/application`) — pura

- `crearAyuda`: aceptar `adminId` en el input y persistirlo.
- `listarAyudas`: extender el filtro a `{ estado?; tipo?; adminId? }`, combinables.
- `obtenerAyuda`, `editarCabecera`, `gestionarMetas`, `avanzarEstado`, `eliminarAyuda`: recibir el
  `adminId` del solicitante; tras leer la actividad, **verificar propiedad**; si no es el dueño, lanzar el
  error de dominio (que la capa `app` traduce a 404).
- Panel (008): `contarAyudasPorEstado`, `listarPrioridadRecolectando` y los agregados de aportes/sectores
  que hoy son globales aceptan `adminId?` para acotar al dueño. En el contexto del panel siempre se pasa.
- Mantener la capa **pura**; actualizar `fakes.ts` para contemplar `adminId`.

## 4. Infraestructura (`src/modules/ayudas/infrastructure`)

- `PrismaAyudaRepository`:
  - Mapear `adminId` en lectura (fila → entidad) y escritura (alta).
  - Aplicar el filtro por `adminId` en `listar` y en las consultas de agregación del panel (junto a
    `estado`/`tipo`).
  - Sin casts de enums a mano.

## 5. Presentación (`src/app` + `ui`) — solo `ADMIN`

- Obtener el `adminId` de la sesión (helper de 002/015) en cada ruta de `/(admin)/panel/ayudas` y en
  `/panel`.
- **Listado** `/(admin)/panel/ayudas`: pasar `adminId` de sesión al `listarAyudas` (además de los filtros
  de estado/tipo).
- **Detalle / editar / metas / avanzar / eliminar**: pasar el `adminId` de sesión al caso de uso; si el
  caso de uso lanza "no es dueño", responder con `notFound()` (404) en el server component / action.
- **Panel** `/panel` (008): pasar el `adminId` de sesión a las lecturas agregadas.
- **Alta** `/(admin)/panel/ayudas/nueva`: la server action de crear toma el `adminId` de la sesión (no del
  formulario) y lo pasa a `crearAyuda`. Mantener `requireRol(ADMIN)` y `revalidatePath`.
- **No tocar** las rutas de colaborador (`/ayudas`, `/ayudas/[id]`, aportar) ni transparencia
  (`/transparencia`): siguen sin filtrar por dueño.

## 6. Composición (wiring)

- Sin repos/casos de uso nuevos: se extienden firmas. Respetar los límites de capas (`app`/`ui` no
  importan `infrastructure`/`lib` directamente).

## 7. Tests (Vitest)

- `crearAyuda`: la actividad queda con el `adminId` del creador.
- `listarAyudas`: filtra por `adminId`; combinado con `estado`/`tipo`.
- Gestión: `obtenerAyuda`/`editarCabecera`/`gestionarMetas`/`avanzarEstado`/`eliminarAyuda` **rechazan**
  cuando el solicitante no es el dueño y **operan** cuando sí lo es.
- Panel: las agregaciones acotan por `adminId`.
- Confirmar que la suite de 005/008/018 sigue en verde.

## Decisiones

- **Enmienda aditiva:** el `adminId` es un campo más; se reutiliza el módulo `ayudas` y las lecturas del
  panel.
- **Propiedad como regla de dominio** con un único punto de verdad; la capa `app` la traduce a 404.
- **Solo se aísla la gestión del ADMIN;** colaborador y transparencia ven la red completa.
- **Backfill a un único dueño** (admin semilla → primer admin → superadmin), documentado en la migración.

## Validación final

1. Base disponible y `pnpm db:migrate` (migración `add_admin_a_ayuda`; filas previas con dueño, sin nulos).
2. `pnpm test` (dominio, casos de uso, panel, y suites de 005/008/018 en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: con dos cuentas `ADMIN`, comprobar que cada una solo ve/gestiona sus actividades y que
   abrir por URL una actividad ajena da 404; confirmar que un colaborador sigue viendo las de ambos y que
   `/transparencia` no cambia.

## Al terminar

- `constitution/roadmap.md`: mover `022 · Actividades por administrador` a **Hecho ✅** (enmienda 005/008).
- Verificar que `DOC/features/022-actividades-por-administrador.md` refleja lo entregado y revisar que
  `DOC/features/005-ayudas-envio.md` y `008-panel-de-administracion.md` siguen fieles (o anotar el
  aislamiento por dueño).
