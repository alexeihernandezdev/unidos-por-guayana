# 024 · Plan de implementación

> Deriva de `spec.md`. Respeta `constitution/tech-stack.md` (Clean + Screaming, dominio puro,
> sin em-dash/en-dash en texto visible, Next 16 App Router).

## Enfoque general

Rename estructural `Ayuda` -> `Actividad` en las cuatro capas, más dos cambios de dominio:
ciclo de vida dependiente del `tipo` y dos campos nuevos (`horaFin`, `puntoAcopioId`). El rename
es mecánico pero amplio; los cambios de dominio son la parte con reglas nuevas y tests.

Se conserva la palabra "ayuda" como concepto humanitario en textos de negocio (misión,
"solicitud de ayuda", "ayuda humanitaria"): **solo** se renombra la entidad, el módulo, la tabla,
las rutas, las FK y los símbolos de código que nombran a `Ayuda`.

## Decisión técnica clave: un solo enum de estado en base, dos secuencias en el dominio

Postgres no puede tipar una columna "según otra columna". Se usa **un único enum de base**
`EstadoActividad` con la unión de los 7 valores distintos:

```
RECOLECTANDO, LISTO, EN_TRANSITO, ENTREGADO, LISTA, EN_CURSO, REALIZADA
```

`RECOLECTANDO` es el estado inicial compartido por ambas secuencias. La **verdad de qué
transiciones son válidas la module el dominio**, parametrizada por `tipo`:

- `EstadoActividadEnvio` = `RECOLECTANDO -> LISTO -> EN_TRANSITO -> ENTREGADO` (sin cambios vs. hoy).
- `EstadoActividadEvento` = `RECOLECTANDO -> LISTA -> EN_CURSO -> REALIZADA` (nuevo, para
  `JORNADA` y `EVENTO_SOCIAL`).
- `EstadoActividad` = unión de ambos (el tipo de la columna).

La máquina de estados (`maquinaEstados.ts`) pasa a recibir el `tipo` y elige la secuencia. Ambas
secuencias son de un solo sentido; `esEditable`/`esEliminable` siguen siendo "solo en
`RECOLECTANDO`" (primer estado común a las dos).

## Migración (dos archivos, por la restricción de enums de Postgres)

Postgres no permite **usar** un valor de enum recién añadido dentro de la misma transacción que lo
añade. Como el backfill usa los valores nuevos (`LISTA`, `EN_CURSO`, `REALIZADA`), se parte en dos
migraciones dedicadas (rename de recreación descartado para conservar datos):

1. `NNN_rename_ayuda_a_actividad`:
   - `ALTER TYPE "EstadoAyuda" RENAME TO "EstadoActividad"` + `ADD VALUE` de los tres estados nuevos.
   - `ALTER TABLE "ayudas" RENAME TO "actividades"` y rename de su PK, índices y FK a la nomenclatura
     Prisma del nuevo nombre (`actividades_*`) para no dejar drift.
   - `metas_recurso` y `aportes`: `RENAME COLUMN "ayudaId" TO "actividadId"` + rename de FK/índices.
   - Nuevas columnas en `actividades`: `horaFin TIMESTAMP(3)` (nullable), `puntoAcopioId TEXT`
     (nullable) + índice + FK a `puntos_acopio(id)` `ON DELETE SET NULL`.
2. `NNN_backfill_estados_actividad_evento`:
   - `UPDATE "actividades" SET "estado" = CASE ... END WHERE "tipo" IN ('JORNADA','EVENTO_SOCIAL')`
     con remapeo posicional `LISTO->LISTA`, `EN_TRANSITO->EN_CURSO`, `ENTREGADO->REALIZADA`
     (`RECOLECTANDO` no cambia).

## Cambios por capa

### Prisma (`prisma/schema.prisma`)
- `model Ayuda` -> `model Actividad`, `@@map("actividades")`.
- `enum EstadoAyuda` -> `enum EstadoActividad` con los 7 valores.
- Campos nuevos: `horaFin DateTime?`, `puntoAcopioId String?` + relación `puntoAcopio PuntoAcopio?`.
- `MetaRecurso`/`Aporte`: `ayudaId` -> `actividadId`, relación `ayuda` -> `actividad`, `@@unique`.
- `Usuario.ayudas` -> `Usuario.actividades`; `PuntoAcopio` gana inversa `actividades Actividad[]`.

### Dominio (`src/modules/actividades/domain`)
- `EstadoAyuda.ts` -> `EstadoActividad.ts` con las tres uniones (`...Envio`, `...Evento`, unión).
- `maquinaEstados.ts`: `secuenciaDe(tipo)`, `siguienteEstado(tipo, estado)`,
  `puedeAvanzar(tipo, desde, hacia)`, `esEditable`, `esEliminable`.
- `Ayuda.ts` -> `Actividad.ts`: tipos `Actividad`, `NuevaActividad`, `CambiosActividad` (+ `horaFin`,
  `puntoAcopioId`).
- `AyudaRepository.ts` -> `ActividadRepository.ts`: `ActividadRepository`, `FiltroActividades`.
- `reglas.ts`: añade validación de propiedad `puntoAcopioId <-> adminId` (via repo de acopio en app).

### Aplicación (`src/modules/actividades/application`)
- Rename de casos de uso (`crearAyuda` -> `crearActividad`, etc.) y de `deps`/`fakes`/`errors`.
- `crearActividad`/`editarCabecera` aceptan `horaFin?` y `puntoAcopioId?`; validan que el punto
  pertenezca al `adminId` dueño (nuevo puerto `AcopioRepository.perteneceAAdmin` o consulta al repo
  de acopio ya existente). `avanzarEstado` usa la máquina parametrizada por `tipo`.

### Infraestructura
- `PrismaAyudaRepository` -> `PrismaActividadRepository` (mapea `horaFin`, `puntoAcopioId`).

### Presentación (`src/modules/actividades/ui` + rutas)
- Rutas `/ayudas/*` -> `/actividades/*`, `/panel/ayudas/*` -> `/panel/actividades/*` (mover carpetas
  con `git mv` y actualizar enlaces internos y `navConfig`).
- `estados.ts`/`EstadoBadge`: etiqueta según `tipo`. Formulario: selector opcional de punto de
  acopio propio y campo `horaFin` cuando `tipo != ENVIO`.

### Consumidores a actualizar
006 (aportes: `ayudaId` -> `actividadId`, `@/shared/ayudas` -> `@/shared/actividades`), 008 (panel),
009 (transparencia), 022 (ya integrado en la entidad), 023 (aportantes). Fachada `@/shared/ayudas`
-> `@/shared/actividades`; `@/lib/ayudas.ts` -> `@/lib/actividades.ts`.

## Validación
- `pnpm test` (Vitest, fakes en memoria): ambas máquinas de estado, remapeo backfill (test de
  dominio de la función de remapeo), rechazo de `puntoAcopioId` ajeno, regresión de 005/006/022.
- `pnpm exec eslint src`, `pnpm exec next build`.
- Migración aplicada con `prisma migrate deploy` contra Postgres local (Docker, 5435) + `prisma
  generate`.
