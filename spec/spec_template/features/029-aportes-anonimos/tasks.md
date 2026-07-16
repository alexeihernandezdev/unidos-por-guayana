# 029 · Aportes anónimos — Tareas

> Checklist de implementación. Marcar a medida que se avanza.

## Modelo y migración
- [x] `Aporte.esAnonimo Boolean @default(false)` en `prisma/schema.prisma`.
- [x] Migración `aporte_es_anonimo` + backfill (`esAnonimo = true` donde `colaboradorId IS NULL`) escrita.
- [x] **Aplicada** con `prisma migrate deploy` contra la base Neon del `.env` (dev, confirmado por
      Andrea). `prisma migrate status`: "Database schema is up to date!".

## Dominio (puro)
- [x] `Aporte` gana `esAnonimo: boolean`; `NuevoAporte` gana `esAnonimo?: boolean`.
- [x] `reglas.ts`: `ETIQUETA_ANONIMO` + `nombrePublicoAportante(esAnonimo, nombreColaborador)`.

## Aplicación
- [x] `registrarAporteDirecto.ts` (ADMIN dueño, `RECIBIDO`, anónimo, sin colaborador).
- [x] `crearAporte`: acepta y propaga `esAnonimo?`.
- [x] `index.ts`: exportar `registrarAporteDirecto`.

## Infraestructura
- [x] `PrismaAporteRepository`: `esAnonimo` en `FilaAporte`/`mapear`/`crear`; estampar `recibidoEn` en
      `RECIBIDO` sin fecha.
- [x] `listarAportantesDeActividad`: `select` + `nombrePublicoAportante`.
- [x] `fakes.ts`: `esAnonimo` en `crear`; `nombrePublicoAportante` en la lectura.

## Composición
- [x] `src/lib/aportes.ts`: `registrarAporteDirectoServicio`.
- [x] `src/shared/aportes/index.ts`: re-export.

## Presentación
- [x] `AporteForm`: casilla "Aportar de forma anónima" + ayuda; propaga `esAnonimo`.
- [x] `crearAporteAction` + schema: aceptan `esAnonimo`.
- [x] `DonacionDirectaForm.tsx` (nuevo, admin).
- [x] `registrarAporteDirectoAction` (server action, dueño).
- [x] `/panel/actividades/[id]`: sección "Donación directa" en `RECOLECTANDO`.
- [x] `AportesTabla`: "Donación directa" sin colaborador + indicador "Anónimo en público".

## Tests
- [x] `nombrePublicoAportante`.
- [x] `registrarAporteDirecto` (feliz + rechazos).
- [x] `crearAporte` propaga `esAnonimo`.
- [x] `listarAportantesDeActividad` anónimo => "Anónimo", sin fuga de nombre.
- [x] Arreglar `registrarAporteExterno.test.ts` (rename 024).

## Validación
- [x] `pnpm test` verde (373 tests).
- [x] `tsc` / ESLint sin errores en los archivos de la feature (los errores de `tsc` restantes son de
      `solicitudes/*.test.ts`, WIP ajeno a esta feature).
- [ ] `pnpm build` completo — bloqueado por el WIP de `solicitudes` en el árbol de trabajo, no por 029.
- [ ] Prueba manual en `pnpm dev` (tras aplicar la migración): donación directa + colaborador anónimo +
      panel dueño + transparencia.

## Cierre
- [x] `constitution/roadmap.md`: 029 añadida.
- [x] `DOC/features/029-aportes-anonimos.md`.
