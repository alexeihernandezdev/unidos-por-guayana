# 024 · Actividad: renombre y ciclo de vida por tipo

> Estado: **Pendiente** · Enmienda: `005 · Ayudas / Envío`, `008 · Panel de administración`, `009 · Tablero público de transparencia`, `012 · Notificaciones`, `018 · Tipos de actividad en Ayuda`, `022 · Actividades por administrador`, `023 · Registro de aportantes visible al colaborador` · Depende de: `018`, `022` · Roadmap: `constitution/roadmap.md`

> **Contexto.** Surge al preparar `025 · Afiliación a centros de acopio` (donde el admin necesita ver
> "cuántas personas de su red cumplen X recurso" al crear una actividad). Al revisar el flujo se detectó
> que el modelo `Ayuda` (feature 005, con `tipo` desde 018) tiene dos problemas de fondo que conviene
> resolver antes de construir encima: (1) el nombre en código no coincide con el lenguaje del cliente ni
> del resto del sistema ("Actividad" en `mission.md`, rutas y specs recientes), y (2) su ciclo de vida
> (`RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`) está pensado para un envío físico y no encaja con una
> `JORNADA` o un `EVENTO_SOCIAL` (¿qué significa "en tránsito" un evento social?).

## Qué hace

Renombra la entidad `Ayuda` a **`Actividad`** en todas las capas (modelo Prisma, módulo, rutas, tipos) y
le da a cada `tipo` (`ENVIO` | `JORNADA` | `EVENTO_SOCIAL`) su **propio ciclo de vida**, en vez de forzar
los cuatro estados de un envío físico sobre los tres tipos. También añade los campos que le faltaban a
`JORNADA`/`EVENTO_SOCIAL` (hora de fin) y una relación opcional con `PuntoAcopio` (dónde se entrega o se
realiza).

- **Rename `Ayuda` → `Actividad`.** Modelo Prisma (`ayudas` → `actividades`), módulo
  `src/modules/ayudas` → `src/modules/actividades`, rutas `/ayudas/*` y `/panel/ayudas/*` →
  `/actividades/*` y `/panel/actividades/*`, tipos, tests y toda referencia en las features que la
  consumen (006, 008, 009, 012, 022, 023). El vocabulario ya usado en la UI ("Crear envío/jornada/evento
  social") no cambia; cambia el nombre de la entidad subyacente.
- **Ciclo de vida por tipo.** `ENVIO` conserva su secuencia actual
  (`RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`). `JORNADA` y `EVENTO_SOCIAL` usan una secuencia
  propia: `RECOLECTANDO → LISTA → EN_CURSO → REALIZADA`. Ambas secuencias avanzan en un solo sentido y
  comparten la misma forma (cuatro pasos: preparación → listo → en marcha → terminado), solo cambia el
  vocabulario y el enum de valores válidos según el `tipo`.
- **`horaFin` opcional.** Además de `fecha` (que ya es `DateTime` y representa el inicio), se añade
  `horaFin` (`DateTime?`) para que una `JORNADA`/`EVENTO_SOCIAL` declare cuándo termina (p. ej. "de 9:00
  a 13:00"). Un `ENVIO` no la usa.
- **`puntoAcopioId` opcional.** La `Actividad` puede asociar un `PuntoAcopio` del mismo `ADMIN` dueño:
  dónde se recibe el aporte o dónde ocurre la jornada/evento. Nullable: no bloquea crear actividades a un
  `ADMIN` sin puntos registrados aún (011 sigue siendo independiente).
- **Cupo de personas se resuelve con el catálogo existente, no con un campo nuevo.** Para "cuántos
  voluntarios se necesitan" se usa una `MetaRecurso` normal sobre un `Recurso` de categoría `PERSONAL`
  (p. ej. "Voluntarios", unidad "personas"); no se añade un campo `cupoPersonas` dedicado.

## Por qué

`mission.md` y las specs más recientes (009, 018, 022, 023) ya hablan de "Actividad"; el código sigue
llamándola `Ayuda`, lo que obliga a traducir mentalmente entre el lenguaje del negocio y el del código en
cada feature nueva. Es deuda de lenguaje ubicuo: cuanto más tarde se corrija, más superficies hay que
tocar.

El ciclo de vida único es, además, un problema real de cara a `025`: cuando el admin cree una `JORNADA` y
quiera avanzarla, `EN_TRANSITO` no describe nada (no hay envío físico en tránsito), y forzar ese
vocabulario a un evento social confunde tanto al admin como al colaborador que lo lee en `/transparencia`.
Corregirlo ahora evita que `025` (y cualquier feature futura sobre actividades) herede una mentira de
modelo.

## Decisiones tomadas

- **Rename completo, no solo de superficie.** Se renombra el modelo, la tabla, el módulo, las rutas y los
  tipos. Se descartó dejar el código como `Ayuda` con solo la UI diciendo "Actividad": perpetuaría el
  desajuste para todo código futuro. El costo (migración + mover carpetas + actualizar imports) se paga
  una sola vez.
- **Migración de renombre, no de recreación.** `ALTER TABLE ayudas RENAME TO actividades` (y columnas que
  lo requieran) para conservar los datos existentes; no se recrea la tabla ni se pierden actividades ya
  creadas.
- **Dos secuencias de estado, no una genérica.** Se descartó un enum abstracto tipo
  `PREPARACION → LISTA → EJECUCION → COMPLETADA` con relabeling por tipo: pierde precisión (un evento
  social nunca pasa por algo llamado "tránsito" ni al revés) y de todas formas exige migrar el enum
  actual. Se prefiere que el dominio module la verdad: dos máquinas de estado distintas, seleccionada por
  `tipo`, ambas puras y ambas de un solo sentido.
  - `EstadoActividadEnvio`: `RECOLECTANDO` | `LISTO` | `EN_TRANSITO` | `ENTREGADO` (sin cambios respecto
    a hoy).
  - `EstadoActividadEvento`: `RECOLECTANDO` | `LISTA` | `EN_CURSO` | `REALIZADA` (nuevo, para `JORNADA` y
    `EVENTO_SOCIAL`).
  - Backfill: las actividades `JORNADA`/`EVENTO_SOCIAL` que ya existieran con un estado del enum de envío
    se remapean 1 a 1 por posición (`RECOLECTANDO`→`RECOLECTANDO`, `LISTO`→`LISTA`,
    `EN_TRANSITO`→`EN_CURSO`, `ENTREGADO`→`REALIZADA`).
- **La UI muestra el vocabulario del tipo, la validación de transición también depende del tipo.** La
  máquina de estados (regla pura ya existente en el dominio de 005) se parametriza por `tipo`: qué
  transiciones son válidas y cómo se llama cada estado en pantalla.
- **`horaFin` es solo un dato, no cambia el ciclo de vida.** No dispara transiciones automáticas (pasar a
  `REALIZADA` sigue siendo una acción manual del `ADMIN`, igual que hoy `ENTREGADO`).
- **`puntoAcopioId` opcional y con comprobación de propiedad.** Si se indica, debe pertenecer al mismo
  `adminId` dueño de la actividad (mismo patrón de propiedad que usa 011 para sus puntos). Nula por
  defecto: no reabre el registro de actividades ya creadas ni obliga a tener puntos activos.
- **Cupo de personas reutiliza `MetaRecurso`/`Recurso` `PERSONAL`.** Se descartó un campo dedicado
  `cupoPersonas`: hoy `PERSONAL` ya existe como categoría y `Aporte` ya permite "me apunto con N
  personas"; añadir un campo paralelo duplicaría el concepto de meta/progreso que las metas ya resuelven.
- **No se toca la relación con `Recurso`/`MetaRecurso`/`Aporte` más allá de lo anterior.** Sus modelos no
  cambian de forma; solo se actualiza el nombre de la FK/relación (`ayudaId` → `actividadId`) donde
  corresponda.

## Alcance

**Incluye**

- Migración Prisma: `ayudas` → `actividades` (rename de tabla), `ayudaId` → `actividadId` en
  `MetaRecurso`, `Aporte` y cualquier otra tabla que referencie la actividad; nuevo enum
  `EstadoActividadEvento`; columna `estado` se tipa según `tipo` (ver nota técnica de implementación en
  `plan.md`); nuevas columnas `horaFin` (`DateTime?`) y `puntoAcopioId` (`String?`, FK a `PuntoAcopio`).
  Backfill de estados para actividades `JORNADA`/`EVENTO_SOCIAL` existentes.
- Rename de módulo: `src/modules/ayudas` → `src/modules/actividades` (dominio, aplicación,
  infraestructura, UI), conservando la separación de capas de Clean + Screaming.
- Rename de rutas: `/ayudas/*`, `/ayudas/[id]/aportar`, `/panel/ayudas/*` → `/actividades/*`,
  `/actividades/[id]/aportar`, `/panel/actividades/*`. Redirecciones o actualización de enlaces internos
  en todas las features que enlazan a estas rutas (008, 009, 012 cuando exista, 023).
- Dominio: máquina de estados parametrizada por `tipo` (dos secuencias válidas), reglas de transición
  puras, validación de propiedad `puntoAcopioId` ↔ `adminId`.
- Aplicación: casos de uso existentes de 005/022 adaptados al nuevo nombre y a la máquina de estados por
  tipo; nuevo parámetro opcional `puntoAcopioId`/`horaFin` al crear/editar.
- Presentación: formularios y listados de actividad muestran el estado con el vocabulario correcto según
  `tipo`; selector opcional de `PuntoAcopio` del propio admin (si tiene alguno activo); campo de hora de
  fin cuando el `tipo` no es `ENVIO`.
- Tests (Vitest): transición válida/ inválida por cada máquina de estados, remapeo de backfill, rechazo
  de `puntoAcopioId` ajeno, y que el rename no rompa los tests existentes de 005/006/022 (actualizados a
  los nuevos nombres).

**No incluye**

- **Cambios de negocio en metas/aportes.** `MetaRecurso` y `Aporte` no cambian de forma, salvo el rename
  de la FK.
- **Campo dedicado de cupo de personas.** Se resuelve con `MetaRecurso` + `Recurso` `PERSONAL` (ver
  decisiones).
- **Notificar/convocar según categoría de recurso.** Eso es el alcance de `025` y de la implementación
  (enmendada) de `012`; esta feature solo dispone el modelo y el nombre correctos para que esas features
  se construyan encima sin arrastrar la deuda.
- **Exponer `PuntoAcopio` en la transparencia pública** ni cambiar su gestión (sigue siendo de 011).

## Criterios de aceptación

- [ ] El modelo Prisma se llama `Actividad` (tabla `actividades`); no existe referencia viva a `Ayuda`
      como nombre de modelo, módulo o ruta en el código nuevo.
- [ ] Una actividad `ENVIO` sigue transitando `RECOLECTANDO → LISTO → EN_TRANSITO → ENTREGADO`
      exactamente como antes del rename (regresión cero sobre 005/006/022).
- [ ] Una actividad `JORNADA` o `EVENTO_SOCIAL` transita `RECOLECTANDO → LISTA → EN_CURSO → REALIZADA`;
      intentar una transición fuera de esa secuencia (o la del enum equivocado) se **rechaza**.
- [ ] Las actividades `JORNADA`/`EVENTO_SOCIAL` creadas antes de esta feature quedan **remapeadas** a su
      estado equivalente en el nuevo enum (sin quedar en un estado inexistente).
- [ ] El `ADMIN` puede indicar `horaFin` en una `JORNADA`/`EVENTO_SOCIAL`; el campo no aparece (o no
      aplica) para `ENVIO`.
- [ ] El `ADMIN` puede asociar opcionalmente uno de sus `PuntoAcopio` activos a la actividad; intentar
      asociar un punto de otro admin se **rechaza** en servidor.
- [ ] Todas las rutas y enlaces internos apuntan a `/actividades/*` (no quedan enlaces rotos a
      `/ayudas/*`).
- [ ] `pnpm test` cubre ambas máquinas de estado (transiciones válidas e inválidas), el backfill y el
      rechazo de `puntoAcopioId` ajeno, en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores; `actividades/domain` y `actividades/application` permanecen
      **puras**.

## Notas y riesgos

- **Alcance de rename amplio:** toca 005, 006, 008, 009, 012 (aún no implementada, se ajusta al nacer),
  018, 022 y 023. Revisar cada import de `@/modules/ayudas` y cada literal `"AYUDA"` (p. ej.
  `referenciaTipo` que usaría 012) antes de dar la feature por cerrada.
- **Orden recomendado:** esta feature va **antes** de `025 · Afiliación a centros de acopio`, para que la
  nueva feature ya nazca hablando de `Actividad` y no herede el nombre viejo.
- **Sin downtime aceptable en producción real:** el rename de tabla es una operación de un solo paso
  (`RENAME TABLE`), reversible, pero debe ejecutarse en una migración dedicada y probarse en desarrollo
  antes de aplicarse.
- **Prohibido em-dash (`—`) / en-dash (`–`)** en textos visibles (ver `constitution/tech-stack.md`).
- **Next 16:** revisar `node_modules/next/dist/docs/` antes de mover rutas de App Router (segmentos,
  layouts, `generateStaticParams` si aplica).
