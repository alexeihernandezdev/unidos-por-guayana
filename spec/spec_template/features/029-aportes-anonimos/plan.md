# 029 · Aportes anónimos — Plan

> Cómo se implementa la `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, pureza de
> capas, convenciones y límites duros). De adentro hacia afuera: dominio → aplicación → infraestructura →
> composición → presentación → tests.

## Enfoque general

Una sola bandera de dominio (`Aporte.esAnonimo`) gobierna la visibilidad del nombre. Dos entradas al
mismo concepto:

1. **Donación directa del admin** — caso de uso nuevo `registrarAporteDirecto` en `aportes/application`,
   que reusa las validaciones de `crearAporte` pero es ADMIN-dueño y nace `RECIBIDO`/anónimo/sin
   colaborador. **No** se toca `registrarAporteExterno` (014, monetario).
2. **Autoanonimato del colaborador** — `crearAporte` acepta `esAnonimo?` y `AporteForm` gana una casilla.

Orden: **migración `esAnonimo` → dominio (entidad + regla `nombrePublicoAportante`) → aplicación
(`registrarAporteDirecto`, `crearAporte`) (+tests) → infraestructura (`PrismaAporteRepository`, fakes) →
composición → presentación (form colaborador, form admin, tablas) → validación**.

> ⚠️ Antes de tocar server actions / server components de Next 16, leer `node_modules/next/dist/docs/`
> (AGENTS.md). La protección por rol reutiliza 002/015 (`requireRol`, `requireAdminVerificado`).

## 1. Modelo de datos y migración

- En `prisma/schema.prisma`, `model Aporte`: añadir `esAnonimo Boolean @default(false)` (junto a `estado`
  / `nota`, con comentario de la feature 029).
- `pnpm db:migrate --name aporte_es_anonimo` (Docker arriba, puerto 5435).
- Backfill en la propia migración (SQL): `UPDATE "aportes" SET "esAnonimo" = true WHERE "colaboradorId" IS NULL;`

## 2. Dominio `aportes` (`src/modules/aportes/domain`) — puro

- `Aporte.ts`: `Aporte` gana `esAnonimo: boolean`; `NuevoAporte` gana `esAnonimo?: boolean`.
- `reglas.ts`:
  - `export const ETIQUETA_ANONIMO = "Anónimo";`
  - `export function nombrePublicoAportante(esAnonimo: boolean, nombreColaborador: string | null): string`
    devuelve `ETIQUETA_ANONIMO` si `esAnonimo` o no hay nombre; si no, el nombre.

## 3. Aplicación (`src/modules/aportes/application`)

- `registrarAporteDirecto.ts` (nuevo):
  - Input: `{ actividadId, recursoId, cantidad, nota? }`. Firma `(deps, input, actor)`.
  - Reglas: `actor.rol === ADMIN` (si no, `NoAutorizadoError`); `esCantidadAporteValida`; actividad existe
    (`ActividadNoEncontradaError`); `actividad.adminId === actor.id` (si no, `NoAutorizadoError`);
    `estado === RECOLECTANDO` (si no, `ActividadNoAceptaAportesError`); recurso en metas y existente y
    activo (`RecursoFueraDeMetasError`).
  - Crea: `colaboradorId: null`, `esAnonimo: true`, `estado: RECIBIDO`, `registradoPorId: actor.id`,
    `nota: normalizarNota(input.nota)`. Sin fecha explícita (la infra estampa `recibidoEn`).
  - Reusa errores existentes (no se crean nuevos).
- `crearAporte.ts`: `CrearAporteInput` gana `esAnonimo?: boolean`; se pasa a `aportes.crear({ ...,
  esAnonimo: input.esAnonimo ?? false })`.
- `index.ts`: exportar `registrarAporteDirecto`.
- Tests junto a cada caso de uso (ver §7).

## 4. Infraestructura (`src/modules/aportes/infrastructure`)

- `PrismaAporteRepository`:
  - `FilaAporte`: añadir `esAnonimo: boolean`; `mapear`: añadir `esAnonimo: fila.esAnonimo`.
  - `crear`: `data.esAnonimo = datos.esAnonimo ?? false`; estampar `recibidoEn` cuando
    `datos.estado === RECIBIDO && datos.recibidoEn === undefined` (coherencia con el fake y para que la
    donación directa quede con fecha).
  - `listarAportantesDeActividad`: `select` incluye `esAnonimo`; `aportanteNombre =
    nombrePublicoAportante(fila.esAnonimo, fila.colaborador?.nombre ?? null)`.
- Fakes `application/fakes.ts`:
  - `crear`: guardar `esAnonimo: datos.esAnonimo ?? false`.
  - `listarAportantesDeActividad`: usar `nombrePublicoAportante`.

## 5. Composición

- `src/lib/aportes.ts`: importar `registrarAporteDirecto` y exponer
  `registrarAporteDirectoServicio(input, actor)`.
- `src/shared/aportes/index.ts`: re-exportar `registrarAporteDirectoServicio`.

## 6. Presentación

### 6.1 Colaborador (`AporteForm`)

- `AporteFormValores` gana `esAnonimo: boolean` (default `false`).
- Casilla con `Checkbox` de Radix (vía `Controller`), label "Aportar de forma anónima" + ayuda "Tu nombre
  no será visible para otros; el organizador sí lo verá para verificar tu aporte." (sin em-dash).
- `onSubmit` incluye `esAnonimo`.
- `src/app/aportes/actions.ts`: `CrearAporteSchema` + `CrearAporteInputUi` ganan `esAnonimo: boolean`;
  `crearAporteAction` lo pasa a `crearAporteServicio`.

### 6.2 Admin (donación directa)

- `src/modules/aportes/ui/DonacionDirectaForm.tsx` (nuevo, client): selector de recurso (metas),
  `cantidad`, `nota`; llama a la action inyectada; copy "Registrar donación directa". Reusa el patrón de
  `AporteForm` (mismos estilos de campo). Éxito => `router.refresh()`.
- `src/app/aportes/actions.ts`: `registrarAporteDirectoAction(actividadId, input)` con
  `requireAdminVerificado`, `zod` (recursoId, cantidad, nota), llama
  `registrarAporteDirectoServicio({ actividadId, ... }, { id, rol })`, `revalidatePath` del detalle de
  panel y del detalle público `/actividades/${id}` y `/transparencia`. Reusa `traducirError`.
- `src/app/(admin)/panel/actividades/[id]/page.tsx`: cuando la actividad acepta aportes
  (`RECOLECTANDO`), render de una sección "Donación directa" con `DonacionDirectaForm` (opciones desde
  `actividad.metas`), con la action bindeada al `actividad.id`.

### 6.3 Tablas

- `AportantesTabla` (023): sin cambios de código; el DTO ya trae "Anónimo".
- `AportesTabla` (panel dueño): `title` cae a "Donación directa" cuando no hay colaborador; si
  `a.esAnonimo && a.colaborador`, añadir un indicador (meta o badge) "Anónimo en público" para que el
  dueño sepa que ese nombre no se muestra afuera. El nombre/correo real se mantiene (privilegio del dueño).

## 7. Tests (Vitest)

- `domain/reglas` (o `nombrePublicoAportante.test.ts`): anónimo => "Anónimo"; sin nombre => "Anónimo";
  normal => nombre.
- `application/registrarAporteDirecto.test.ts`: crea `RECIBIDO`/anónimo/sin colaborador/`registradoPor`;
  suma al progreso; rechaza no-admin, no-dueño, recurso fuera de metas, recurso archivado, actividad no
  `RECOLECTANDO`, `cantidad <= 0`.
- `application/crearAporte.test.ts`: añadir caso "propaga esAnonimo".
- `application/listarAportantesDeActividad.test.ts`: un aporte anónimo (seed) devuelve "Anónimo" y no el
  nombre real.
- Arreglar `application/registrarAporteExterno.test.ts`: `@/modules/actividades` + `crearActividad` +
  `actividadId` + `progresoPorActividad`.

## Validación final

1. `docker compose up -d` y `pnpm db:migrate` (migración `aporte_es_anonimo` + backfill).
2. `pnpm test` (dominio, `registrarAporteDirecto`, `crearAporte`, lectura 023 y el test de 014 arreglado
   en verde).
3. `pnpm lint` / `pnpm build` sin errores.
4. `pnpm dev`: como `ADMIN` dueño, registrar una donación directa (insumo y monetario) en una actividad
   `RECOLECTANDO`; verla sumar al progreso y aparecer como "Anónimo" en el registro de 023 y como
   "Donación directa" en el panel. Como `COLABORADOR`, aportar con la casilla marcada; comprobar que en
   023 sale "Anónimo" pero en el panel del admin dueño aparece el nombre + correo. Confirmar que
   `/transparencia` no muestra nombres.

## Al terminar

- Actualizar `constitution/roadmap.md`: añadir `029 · Aportes anónimos` a **Hecho ✅** y anotar la
  enmienda a 006/014/023.
- Enmendar la nota de 006/014/023 si procede (la donación directa general vive aquí; 023 gana el caso
  "Anónimo").
- Generar/actualizar `DOC/features/029-aportes-anonimos.md`.
